/**
 * Copyright (c) 2010-2025 Contributors to the openHAB project
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * openHAB handler for incoming intents from Google Assistant platform
 *
 * @author Mehmet Arziman - Initial contribution
 * @author Michael Krug - Rework
 *
 */
const findDeviceType = require('./deviceMatcher').findDeviceType;
const findCommandHandler = require('./commandMatcher').findCommandHandler;
const { ERROR_CODES, GoogleAssistantError } = require('./googleErrorCodes');

class OpenHAB {
  /**
   * @param {object} apiHandler
   */
  constructor(apiHandler) {
    this._apiHandler = apiHandler;
  }

  /**
   * @param {object} headers
   */
  setTokenFromHeader(headers) {
    this._apiHandler.authToken = headers.authorization ? headers.authorization.split(' ')[1] : null;
  }

  onDisconnect() {
    return {};
  }

  /**
   * @param {object} body
   * @param {object} headers
   */
  async onSync(body, headers) {
    console.log('openhabGoogleAssistant - onSync');

    this.setTokenFromHeader(headers);

    const payload = await this.handleSync().catch(() => ({
      errorCode: ERROR_CODES.ACTION_NOT_AVAILABLE,
      status: 'ERROR',
      devices: []
    }));

    return {
      requestId: body.requestId,
      payload: payload
    };
  }

  /**
   * @param {object} body
   * @param {object} headers
   */
  async onQuery(body, headers) {
    const devices = body?.inputs?.[0]?.payload?.devices || [];

    console.log(`openhabGoogleAssistant - onQuery - devices: ${JSON.stringify(devices)}`);

    this.setTokenFromHeader(headers);

    const payload = await this.handleQuery(devices).catch(() => ({
      errorCode: ERROR_CODES.ACTION_NOT_AVAILABLE,
      status: 'ERROR',
      devices: {}
    }));

    return {
      requestId: body.requestId,
      payload: payload
    };
  }

  /**
   * @param {object} body
   * @param {object} headers
   */
  async onExecute(body, headers) {
    const commands = body?.inputs?.[0]?.payload?.commands || [];

    console.log(`openhabGoogleAssistant - onExecute - commands: ${JSON.stringify(commands)}`);

    this.setTokenFromHeader(headers);

    const payload = await this.handleExecute(commands).catch(() => ({
      errorCode: ERROR_CODES.ACTION_NOT_AVAILABLE,
      status: 'ERROR',
      commands: []
    }));

    return {
      requestId: body.requestId,
      payload: payload
    };
  }

  handleSync() {
    return this._apiHandler.getItems().then((items) => {
      const discoveredDevicesList = [];
      items = items.filter((item) => item.metadata && item.metadata.ga);
      items.forEach((item) => {
        item.members = items.filter((member) => member.groupNames && member.groupNames.includes(item.name));
        const DeviceType = findDeviceType(item);
        if (DeviceType) {
          console.log(
            `openhabGoogleAssistant - handleSync - SYNC is adding: ${item.type}:${item.name}` +
              ` with type: ${DeviceType.type}`
          );
          discoveredDevicesList.push(DeviceType.getMetadata(item));
        }
      });
      return { devices: discoveredDevicesList };
    });
  }

  /**
   * @param {array} devices
   */
  handleQuery(devices) {
    const payload = { devices: {} };
    const promises = devices.map((device) =>
      this._apiHandler
        .getItem(device.id)
        .then((item) => {
          const DeviceType = findDeviceType(item);
          if (!DeviceType) {
            throw new GoogleAssistantError(
              ERROR_CODES.DEVICE_NOT_FOUND,
              `Device type not found for item: ${item.type} ${item.name}`
            );
          }
          if (item.state === 'NULL' && !DeviceType.supportedMembers.length) {
            throw new GoogleAssistantError(
              ERROR_CODES.DEVICE_NOT_READY,
              `Item state is NULL: ${item.type} ${item.name}`
            );
          }
          payload.devices[device.id] = { status: 'SUCCESS', online: true, ...DeviceType.getState(item) };
        })
        .catch((error) => {
          console.error(`openhabGoogleAssistant - handleQuery - getItem: ERROR ${JSON.stringify(error)}`);
          let errorCode = error.errorCode || ERROR_CODES.DEVICE_OFFLINE;
          if (error.statusCode === 404) {
            errorCode = ERROR_CODES.DEVICE_NOT_FOUND;
          } else if (error.statusCode === 406) {
            errorCode = ERROR_CODES.DEVICE_NOT_READY;
          }
          payload.devices[device.id] = {
            status: 'ERROR',
            errorCode
          };
          if (error.debugString) {
            payload.devices[device.id].debugString = error.debugString;
          }
        })
    );

    return Promise.all(promises).then(() => payload);
  }

  /**
   * @param {array} commands
   */
  handleExecute(commands) {
    const promises = [];
    commands.forEach((command) => {
      command.execution.forEach((execution) => {
        // Special handling of ThermostatTemperatureSetRange that requires updating two values
        if (execution.command === 'action.devices.commands.ThermostatTemperatureSetRange') {
          const SetHigh = findCommandHandler(
            'action.devices.commands.ThermostatTemperatureSetpointHigh',
            execution.params
          );
          const SetLow = findCommandHandler(
            'action.devices.commands.ThermostatTemperatureSetpointLow',
            execution.params
          );
          if (SetHigh && SetLow) {
            promises.push(
              SetHigh.execute(this._apiHandler, command.devices, execution.params, execution.challenge)
                .then(() => SetLow.execute(this._apiHandler, command.devices, execution.params, execution.challenge))
                .catch((error) => {
                  if (error.challengeNeeded) {
                    return {
                      ids: command.devices.map((device) => device.id),
                      status: 'ERROR',
                      errorCode: ERROR_CODES.CHALLENGE_NEEDED,
                      challengeNeeded: error.challengeNeeded
                    };
                  }
                  return {
                    ids: command.devices.map((device) => device.id),
                    status: 'ERROR',
                    errorCode: error.errorCode || ERROR_CODES.DEVICE_OFFLINE,
                    ...(error.debugString && { debugString: error.debugString })
                  };
                })
            );
            return;
          }
        }
        const CommandHandler = findCommandHandler(execution.command, execution.params);
        if (!CommandHandler) {
          console.error(
            `openhabGoogleAssistant - handleExecute - functionNotSupported: ERROR ${JSON.stringify(execution)}`
          );
          promises.push(
            Promise.resolve({
              ids: command.devices.map((device) => device.id),
              status: 'ERROR',
              errorCode: ERROR_CODES.FUNCTION_NOT_SUPPORTED
            })
          );
          return;
        }
        promises.push(
          CommandHandler.execute(this._apiHandler, command.devices, execution.params, execution.challenge).catch(
            (error) => {
              if (error.challengeNeeded) {
                return {
                  ids: command.devices.map((device) => device.id),
                  status: 'ERROR',
                  errorCode: ERROR_CODES.CHALLENGE_NEEDED,
                  challengeNeeded: error.challengeNeeded
                };
              }
              return {
                ids: command.devices.map((device) => device.id),
                status: 'ERROR',
                errorCode: error.errorCode || ERROR_CODES.DEVICE_OFFLINE,
                ...(error.debugString && { debugString: error.debugString })
              };
            }
          )
        );
      });
    });

    return Promise.all(promises).then((responseDetails) => {
      let responses = [];
      responseDetails.forEach((response) => (responses = responses.concat(response)));
      return { commands: responses };
    });
  }
}

module.exports = OpenHAB;

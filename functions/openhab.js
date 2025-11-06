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
      errorCode: 'actionNotAvailable',
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
    const devices =
      (body && body.inputs && body.inputs[0] && body.inputs[0].payload && body.inputs[0].payload.devices) || [];

    console.log(`openhabGoogleAssistant - onQuery - devices: ${JSON.stringify(devices)}`);

    this.setTokenFromHeader(headers);

    const payload = await this.handleQuery(devices).catch(() => ({
      errorCode: 'actionNotAvailable',
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
    const commands =
      (body && body.inputs && body.inputs[0] && body.inputs[0].payload && body.inputs[0].payload.commands) || [];

    console.log(`openhabGoogleAssistant - onExecute - commands: ${JSON.stringify(commands)}`);

    this.setTokenFromHeader(headers);

    const payload = await this.handleExecute(commands).catch(() => ({
      errorCode: 'actionNotAvailable',
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
            throw { statusCode: 404, message: `Device type not found for item: ${item.type} ${item.name}` };
          }
          if (item.state === 'NULL' && !DeviceType.supportedMembers.length) {
            throw { statusCode: 406, message: `Item state is NULL: ${item.type} ${item.name}` };
          }
          payload.devices[device.id] = { status: 'SUCCESS', online: true, ...DeviceType.getState(item) };
        })
        .catch((error) => {
          console.error(`openhabGoogleAssistant - handleQuery - getItem: ERROR ${JSON.stringify(error)}`);
          payload.devices[device.id] = {
            status: 'ERROR',
            errorCode:
              error.statusCode === 404
                ? 'deviceNotFound'
                : error.statusCode === 406
                  ? 'deviceNotReady'
                  : 'deviceOffline'
          };
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
              SetHigh.execute(this._apiHandler, command.devices, execution.params, execution.challenge).then(() =>
                SetLow.execute(this._apiHandler, command.devices, execution.params, execution.challenge)
              )
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
              errorCode: 'functionNotSupported'
            })
          );
          return;
        }
        promises.push(CommandHandler.execute(this._apiHandler, command.devices, execution.params, execution.challenge));
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

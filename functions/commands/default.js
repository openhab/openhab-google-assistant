/* eslint-disable no-unused-vars */
const ackSupported = [
  'action.devices.commands.ArmDisarm',
  'action.devices.commands.Fill',
  'action.devices.commands.LockUnlock',
  'action.devices.commands.OnOff',
  'action.devices.commands.OpenClose',
  'action.devices.commands.ActivateScene',
  'action.devices.commands.ThermostatTemperatureSetpoint',
  'action.devices.commands.ThermostatTemperatureSetRange',
  'action.devices.commands.ThermostatSetMode',
  'action.devices.commands.TemperatureRelative'
];

const findDeviceType = require('../deviceMatcher').findDeviceType;

class DefaultCommand {
  static get type() {
    return '';
  }

  /**
   * @param {object} params
   */
  static validateParams(params) {
    return true;
  }

  /**
   * Is the requested new state change valid?
   * @param {string | null} target Requested target state
   * @param {string} state Current state of item
   * @param {object} params Parameters of the command
   * @returns {void} returns if current state is different otherwise throws error
   */
  static checkCurrentState(target, state, params) {
    if (target === state) {
      throw { errorCode: 'alreadyInState' };
    }
  }

  /**
   * @param {object} item
   */
  static getNormalizedState(item) {
    return item.type.startsWith('Number:') ? item.state.split(' ')[0] : item.state;
  }

  static get requiresUpdateValidation() {
    return false;
  }

  /**
   * Check if new state is as expected.
   * @param {object} params
   * @param {object} item
   * @param {object} device
   * @return {object} Error message if state update failed. Null if all ok.
   */
  static validateUpdate(params, item, device) {
    return;
  }

  /**
   * @param {object} params
   * @param {object} item
   * @param {object} device
   * @returns {string | null}
   */
  static convertParamsToValue(params, item, device) {
    return null;
  }

  /**
   * @param {object} params
   * @param {object} item
   * @param {object} device
   */
  static getResponseStates(params, item, device) {
    return {};
  }

  /**
   * @param {object} device
   * @param {object} params
   */
  static getItemName(device, params) {
    return device.id;
  }

  /**
   * @param {object} device
   */
  static getDeviceType(device) {
    return device.customData?.deviceType || '';
  }

  /**
   * @param {object} device
   */
  static getItemType(device) {
    return device.customData?.itemType || '';
  }

  /**
   * @param {object} device
   */
  static getMembers(device) {
    return device.customData?.members || {};
  }

  /**
   * @param {object} device
   */
  static isInverted(device) {
    return !!device.customData?.inverted;
  }

  /**
   * @param {object} device
   */
  static requiresItem(device) {
    return false;
  }

  /*
   * Allow individual commands to choose when to enforce the pin
   * e.g. Security System only enforcing for disarming but not arming
   */
  static bypassPin(device, params) {
    return false;
  }

  /**
   * @param {object} device
   * @param {object} challenge
   */
  static handleAuthPin(device, challenge, params) {
    const pinRequired = device.customData?.pinNeeded || device.customData?.tfaPin;
    const pinReceived = challenge?.pin;

    if (this.bypassPin(device, params) || !pinRequired || pinRequired === pinReceived) {
      return;
    }

    return {
      ids: [device.id],
      status: 'ERROR',
      errorCode: 'challengeNeeded',
      challengeNeeded: {
        type: !challenge || !challenge.pin ? 'pinNeeded' : 'challengeFailedPinNeeded'
      }
    };
  }

  /**
   * @param {object} device
   * @param {object} challenge
   * @param {object} responseStates
   */
  static handleAuthAck(device, challenge, responseStates) {
    if (!device.customData || !(device.customData.ackNeeded || device.customData.tfaAck) || challenge?.ack === true) {
      return;
    }
    return {
      ids: [device.id],
      status: 'ERROR',
      states: responseStates,
      errorCode: 'challengeNeeded',
      challengeNeeded: {
        type: 'ackNeeded'
      }
    };
  }

  static getDelayPromise(device) {
    const secondsToWait = device.customData?.waitForStateChange || 0;
    if (secondsToWait === 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      console.log(`openhabGoogleAssistant - ${this.type}: Waiting ${secondsToWait} second(s) for state to update`);
      setTimeout(() => {
        console.log(`openhabGoogleAssistant - ${this.type}: Finished Waiting`);
        resolve(true);
      }, secondsToWait * 1000);
    });
  }

  static handleUpdateValidation(apiHandler, device, params) {
    return this.getDelayPromise(device).then(() => {
      return apiHandler.getItem(device.id).then((item) => {
        const validateUpdateResponse = this.validateUpdate(params, item, device);
        if (validateUpdateResponse) {
          return validateUpdateResponse;
        } else {
          const DeviceType = findDeviceType(item);
          if (!DeviceType) {
            throw { statusCode: 404 };
          }
          return {
            ids: [device.id],
            status: 'SUCCESS',
            states: Object.assign({ online: true }, DeviceType.getState(item))
          };
        }
      });
    });
  }

  /**
   * @param {object} apiHandler
   * @param {array} devices
   * @param {object} params
   * @param {object} challenge
   */
  static execute(apiHandler, devices, params, challenge) {
    const commandsResponse = [];
    const promises = devices.map((device) => {
      const authPinResponse = this.handleAuthPin(device, challenge, params);
      if (authPinResponse) {
        commandsResponse.push(authPinResponse);
        return Promise.resolve();
      }

      const ackWithState =
        ackSupported.includes(this.type) &&
        device.customData &&
        (device.customData.ackNeeded || device.customData.tfaAck) &&
        !challenge?.ack;

      const shouldCheckState = device.customData?.checkState;

      let getItemPromise = Promise.resolve({ name: device.id, state: null, members: [] });
      if (this.requiresItem(device) || ackWithState || shouldCheckState) {
        getItemPromise = apiHandler.getItem(device.id);
      }

      return getItemPromise
        .then((item) => {
          const targetItem = this.getItemName(device, params);
          const targetValue = this.convertParamsToValue(params, item, device);
          if (shouldCheckState) {
            let currentState = this.getNormalizedState(item);
            if (targetItem !== device.id && item.members && item.members.length) {
              const member = item.members.find((m) => m.name === targetItem);
              currentState = member ? this.getNormalizedState(member) : currentState;
            }
            this.checkCurrentState(targetValue, currentState, params);
          }

          const responseStates = this.getResponseStates(params, item, device);
          if (Object.keys(responseStates).length) {
            responseStates.online = true;
          }

          const authAckResponse = this.handleAuthAck(device, challenge, responseStates);
          if (authAckResponse) {
            commandsResponse.push(authAckResponse);
            return;
          }

          let sendCommandPromise = Promise.resolve();
          if (typeof targetItem === 'string' && typeof targetValue === 'string') {
            sendCommandPromise = apiHandler.sendCommand(targetItem, targetValue);
          }

          return sendCommandPromise.then(async () => {
            if (this.requiresUpdateValidation) {
              commandsResponse.push(await this.handleUpdateValidation(apiHandler, device, params));
            } else {
              commandsResponse.push({
                ids: [device.id],
                status: 'SUCCESS',
                states: responseStates
              });
            }
          });
        })
        .catch((error) => {
          console.error(`openhabGoogleAssistant - ${this.type}: ERROR ${JSON.stringify(error)}`);
          commandsResponse.push({
            ids: [device.id],
            status: 'ERROR',
            errorCode:
              typeof error.errorCode === 'string'
                ? error.errorCode
                : error.statusCode == 404
                  ? 'deviceNotFound'
                  : error.statusCode == 400
                    ? 'notSupported'
                    : 'deviceOffline'
          });
        });
    });
    return Promise.all(promises).then(() => commandsResponse);
  }
}

module.exports = DefaultCommand;

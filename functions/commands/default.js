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
   * @param {string} target Requested change params
   * @param {string} state Current state of item
   * @param {object} params Parameters of the command
   * @returns {void} returns if current state is different otherwise throws error
   */
  static checkCurrentState(target, state, params) {
    if (target === state) {
      throw { errorCode: 'alreadyInState' };
    }
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
   * @param {object} item
   * @param {object} device
   * @param {object} params
   */
  static getItemNameAndState(item, device, params) {
    return { name: item.name, state: item.state };
  }

  /**
   * @param {object} device
   */
  static getDeviceType(device) {
    return (device.customData && device.customData.deviceType) || '';
  }

  /**
   * @param {object} device
   */
  static getItemType(device) {
    return (device.customData && device.customData.itemType) || '';
  }

  /**
   * @param {object} device
   */
  static isInverted(device) {
    return (device.customData && device.customData.inverted === true) || false;
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
    const pinRequired = device.customData && (device.customData.pinNeeded || device.customData.tfaPin);
    const pinReceived = challenge && challenge.pin;

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
    if (
      !device.customData ||
      !(device.customData.ackNeeded || device.customData.tfaAck) ||
      (challenge && challenge.ack === true)
    ) {
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
    const secondsToWait = (device.customData && device.customData.waitForStateChange) || 0;
    if (secondsToWait === 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      console.log(`openhabGoogleAssistant - ${this.type}: Waiting ${secondsToWait} second(s) for state to update`);
      setTimeout(() => {
        console.log(`openhabGoogleAssistant - ${this.type}: Finished Waiting`);
        resolve();
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
          const getDeviceForItem = require('../devices').getDeviceForItem;
          const deviceType = getDeviceForItem(item);
          if (!deviceType) {
            throw { statusCode: 404 };
          }
          return {
            ids: [device.id],
            status: 'SUCCESS',
            states: Object.assign({ online: true }, deviceType.getState(item))
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
        !(challenge && challenge.ack);

      const shouldCheckState = device.customData && device.customData.checkState;

      let getItemPromise = Promise.resolve({ name: device.id, state: null });
      if (this.requiresItem(device) || ackWithState || shouldCheckState) {
        getItemPromise = apiHandler.getItem(device.id);
      }

      return getItemPromise
        .then((item) => {
          const targetItem = this.getItemNameAndState(item, device, params);
          const targetValue = this.convertParamsToValue(params, item, device);
          if (shouldCheckState) {
            this.checkCurrentState(targetValue, targetItem.state, params);
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
          if (typeof targetItem.name === 'string' && typeof targetValue === 'string') {
            sendCommandPromise = apiHandler.sendCommand(targetItem.name, targetValue);
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

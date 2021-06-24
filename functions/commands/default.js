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
   * Is the requested new state valid
   * @param {object} params Requested change params
   * @param {object} item Current state of item
   * @returns {object} Error response if invalid state change or null if the state change is allowed
   */
  static validateStateChange(params, item, device) {
    return;
  }

  /**
   * Must the state change be checked before applying?
   * @returns {boolean}
   */
  static shouldValidateStateChange() {
    return false;
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
   * Get the new state to be returned to Google Home
   * @param {object} params Original command params received
   * @param {object} item The state of the item after executing the command
   * @param {object} device Google Home Graph device
   * @return {object} New state to send to Google in the response
   */
  static getNewState(params, item, device) {
    return this.getResponseStates(params, item, device);
  }

  static shouldGetLatestState() {
    return false;
  }

  /**
   * Check if new state is as expected.
   * @param {object} params
   * @param {object} item
   * @param {object} device
   * @return {object} Error message if state update failed. Null if all ok.
   */
  static checkUpdateFailed(params, item, device) {
    return;
  }

  /**
   * Wait x seconds for the state to update within OpenHab
   * @param {object} device Google Home Graph device
   * @returns {number} Seconds to wait before querying state. 0 if disabled
   */
  static waitForStateChange(device) {
    if (device.customData && device.customData.waitForStateChange) {
      return device.customData.waitForStateChange;
    }
    return 0;
  }

  /**
   * @param {object} item
   * @param {object} device
   * @param {object} params
   */
  static getItemName(item, device, params) {
    return item.name;
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
    return device.customData && device.customData.inverted === true;
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
    if (this.bypassPin(device, params)) {
      return;
    }

    let pinRequired = device.customData && (device.customData.pinNeeded || device.customData.tfaPin);
    let pinReceived = challenge && challend.pin;

    if (!pinRequired || pinRequired === pinReceived) {
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

  static delayPromise(device) {
    const secondsToWait = this.waitForStateChange(device);
    if (secondsToWait === 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      console.log(`Waiting ${secondsToWait} second(s) for state to update`);
      setTimeout(() => {
        console.log(`Finished Waiting`);
        resolve();
      }, secondsToWait * 1000);
    });
  }

  static getItemState(device, expectedState, apiHandler) {
    if (this.shouldGetLatestState()) {
      return apiHandler.getItem(device.id);
    }
    return Promise.resolve(expectedState);
  }

  /**
   * @param {object} apiHandler
   * @param {array} devices
   * @param {object} params
   * @param {object} challenge
   */
  static execute(apiHandler, devices, params, challenge) {
    console.log(`openhabGoogleAssistant - ${this.type}: ${JSON.stringify({ devices: devices, params: params })}`);
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

      const confirmStateChange = this.shouldValidateStateChange();
      let getItemPromise = Promise.resolve({ name: device.id });
      if (this.requiresItem(device) || ackWithState || confirmStateChange) {
        getItemPromise = apiHandler.getItem(device.id);
      }

      return getItemPromise
        .then((item) => {
          const responseStates = this.getResponseStates(params, item, device);
          if (Object.keys(responseStates).length) {
            responseStates.online = true;
          }

          if (confirmStateChange) {
            const preCheckResponse = this.validateStateChange(params, item, device);
            if (preCheckResponse) {
              commandsResponse.push(preCheckResponse);
              return;
            }
          }

          const authAckResponse = this.handleAuthAck(device, challenge, responseStates);
          if (authAckResponse) {
            commandsResponse.push(authAckResponse);
            return;
          }

          const targetItem = this.getItemName(item, device, params);
          const targetValue = this.convertParamsToValue(params, item, device);
          let sendCommandPromise = Promise.resolve();
          if (typeof targetItem === 'string' && typeof targetValue === 'string') {
            sendCommandPromise = apiHandler.sendCommand(targetItem, targetValue);
          }
          return sendCommandPromise
            .then(() => this.delayPromise(device))
            .then(() => this.getItemState(device, responseStates, apiHandler))
            .then((newState) => {
              const updateFailedResponse = this.checkUpdateFailed(params, newState, device);
              if (updateFailedResponse) {
                commandsResponse.push(updateFailedResponse);
                return;
              }
              let updatedResponseState = this.shouldGetLatestState()
                ? this.getNewState(params, newState, device)
                : responseStates;

              commandsResponse.push({
                ids: [device.id],
                status: 'SUCCESS',
                states: updatedResponseState
              });
            });
        })
        .catch((error) => {
          console.error(`openhabGoogleAssistant - ${this.type}: ERROR ${JSON.stringify(error)}`);
          console.error(error.stack);
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

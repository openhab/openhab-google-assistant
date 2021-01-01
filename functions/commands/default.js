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
   */
  static getItemName(item, device) {
    return item.name;
  }

  /**
   * @param {object} device
   */
  static getDeviceType(device) {
    return device.customData && device.customData.deviceType || '';
  }

  /**
   * @param {object} device
   */
  static getItemType(device) {
    return device.customData && device.customData.itemType || '';
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

  /**
   * @param {object} device
   * @param {object} challenge
   */
  static handleAuthPin(device, challenge) {
    if (!device.customData || !device.customData.pinNeeded || challenge && challenge.pin === device.customData.pinNeeded) {
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
    if (!device.customData || !device.customData.ackNeeded || challenge && challenge.ack === true) {
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

      const authPinResponse = this.handleAuthPin(device, challenge);
      if (authPinResponse) {
        commandsResponse.push(authPinResponse);
        return Promise.resolve();
      }

      const ackWithState = ackSupported.includes(this.type) && device.customData && device.customData.ackNeeded && !challenge.ack;

      let getItemPromise = Promise.resolve(({ name: device.id }));
      if (this.requiresItem(device) || ackWithState) {
        getItemPromise = apiHandler.getItem(device.id);
      }

      return getItemPromise.then((item) => {
        const responseStates = this.getResponseStates(params, item, device);
        if (Object.keys(responseStates).length) {
          responseStates.online = true;
        }

        const authAckResponse = this.handleAuthAck(device, challenge, responseStates);
        if (authAckResponse) {
          commandsResponse.push(authAckResponse);
          return;
        }

        const targetItem = this.getItemName(item, device);
        const targetValue = this.convertParamsToValue(params, item, device);
        let sendCommandPromise = Promise.resolve();
        if (typeof targetItem === 'string' && typeof targetValue === 'string') {
          sendCommandPromise = apiHandler.sendCommand(targetItem, targetValue);
        }
        return sendCommandPromise.then(() => {
          commandsResponse.push({
            ids: [device.id],
            status: 'SUCCESS',
            states: responseStates
          });
        });
      }).catch((error) => {
        console.error(`openhabGoogleAssistant - ${this.type}: ERROR ${JSON.stringify(error)}`);
        commandsResponse.push({
          ids: [device.id],
          status: 'ERROR',
          errorCode: error.statusCode == 404 ? 'deviceNotFound' : error.statusCode == 400 ? 'notSupported' : 'deviceOffline'
        });
      });
    });
    return Promise.all(promises).then(() => commandsResponse);
  }
}

module.exports = DefaultCommand;

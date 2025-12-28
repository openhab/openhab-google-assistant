const DefaultCommand = require('./default.js');
const { ERROR_CODES, GoogleAssistantError } = require('../googleErrorCodes.js');

class StartStop extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.StartStop';
  }

  static validateParams(params) {
    return 'start' in params && typeof params.start === 'boolean';
  }

  static convertParamsToValue(params, _, device) {
    const itemType = this.getItemType(device);
    if (itemType === 'Contact') {
      throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'Contact items cannot be used with StartStop command');
    }
    if (itemType === 'Rollershutter') {
      return params.start ? 'MOVE' : 'STOP';
    }
    return params.start ? 'ON' : 'OFF';
  }

  static getItemName(device) {
    if (this.getDeviceType(device) === 'Vacuum') {
      const members = this.getMembers(device);
      if ('vacuumPower' in members) {
        return members.vacuumPower;
      }
      throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'Vacuum has no vacuumPower member configured');
    }
    return device.id;
  }

  static getResponseStates(params) {
    return {
      isRunning: params.start,
      isPaused: !params.start
    };
  }

  static checkCurrentState(target, state, params) {
    if (target === state) {
      throw new GoogleAssistantError(
        params.start ? ERROR_CODES.ALREADY_STARTED : ERROR_CODES.ALREADY_STOPPED,
        `Device is already ${params.start ? 'started' : 'stopped'}`
      );
    }
  }
}

module.exports = StartStop;

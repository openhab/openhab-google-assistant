const DefaultCommand = require('./default.js');
const { ERROR_CODES, GoogleAssistantError } = require('../googleErrorCodes.js');

class BrightnessAbsolute extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.BrightnessAbsolute';
  }

  static validateParams(params) {
    return 'brightness' in params && typeof params.brightness === 'number';
  }

  static getItemName(device) {
    if (this.getDeviceType(device) === 'SpecialColorLight') {
      const members = this.getMembers(device);
      if ('lightBrightness' in members) {
        return members.lightBrightness;
      }
      throw new GoogleAssistantError(
        ERROR_CODES.NOT_SUPPORTED,
        'SpecialColorLight has no lightBrightness member configured'
      );
    }
    return device.id;
  }

  static convertParamsToValue(params) {
    return params.brightness.toString();
  }

  static getResponseStates(params) {
    return {
      brightness: params.brightness
    };
  }

  static checkCurrentState(target, state, params) {
    const targetBrightness = parseInt(target);
    const currentBrightness = parseInt(state);

    if (!isNaN(targetBrightness) && !isNaN(currentBrightness)) {
      if (Math.abs(targetBrightness - currentBrightness) < 1) {
        throw new GoogleAssistantError(ERROR_CODES.ALREADY_IN_STATE, `Brightness is already at ${params.brightness}%`);
      }
    }
  }
}

module.exports = BrightnessAbsolute;

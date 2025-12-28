const DefaultCommand = require('./default.js');
const { ERROR_CODES, GoogleAssistantError } = require('../googleErrorCodes.js');

class SetModes extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.SetModes';
  }

  static validateParams(params) {
    return 'updateModeSettings' in params && typeof params.updateModeSettings === 'object';
  }

  static getItemName(device) {
    const deviceType = this.getDeviceType(device);
    const members = this.getMembers(device);
    if (deviceType.startsWith('DynamicModes')) {
      if ('modesCurrentMode' in members) {
        return members.modesCurrentMode;
      }
      throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'Device has no modesCurrentMode member configured');
    }
    if (['AirPurifier', 'Fan', 'Hood', 'ACUnit'].includes(deviceType)) {
      if ('fanMode' in members) {
        return members.fanMode;
      }
      throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'Device has no fanMode member configured');
    }
    return device.id;
  }

  static convertParamsToValue(params) {
    const mode = Object.keys(params.updateModeSettings)[0];
    return params.updateModeSettings[mode].toString();
  }

  static getResponseStates(params) {
    const mode = Object.keys(params.updateModeSettings)[0];
    return {
      currentModeSettings: {
        [mode]: params.updateModeSettings[mode]
      }
    };
  }
}

module.exports = SetModes;

const DefaultCommand = require('./default.js');

class SetModes extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.SetModes';
  }

  static validateParams(params) {
    return 'updateModeSettings' in params && typeof params.updateModeSettings === 'object';
  }

  static getItemName(device) {
    const deviceType = this.getDeviceType(device);
    const members = (device.customData && device.customData.members) || {};
    if (['AirPurifier', 'Fan', 'Hood'].includes(deviceType)) {
      if ('fanMode' in members) {
        return members.fanMode;
      }
      throw { statusCode: 400 };
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

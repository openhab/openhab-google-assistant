const DefaultCommand = require('./default.js');

class SetFanSpeed extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.SetFanSpeed';
  }

  static validateParams(params) {
    return 'fanSpeed' in params && typeof params.fanSpeed === 'string';
  }

  static getItemName(device) {
    const deviceType = this.getDeviceType(device);
    if (['AirPurifier', 'Fan', 'Hood'].includes(deviceType) && this.getItemType(device) !== 'Dimmer') {
      const members = this.getMembers(device);
      if ('fanSpeed' in members) {
        return members.fanSpeed;
      }
      throw { statusCode: 400 };
    }
    return device.id;
  }

  static convertParamsToValue(params) {
    return params.fanSpeed.toString();
  }

  static getResponseStates(params) {
    return {
      currentFanSpeedSetting: params.fanSpeed
    };
  }
}

module.exports = SetFanSpeed;

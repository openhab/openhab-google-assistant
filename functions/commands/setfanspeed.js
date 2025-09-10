const DefaultCommand = require('./default.js');

class SetFanSpeed extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.SetFanSpeed';
  }

  static validateParams(params) {
    return (
      ('fanSpeed' in params && typeof params.fanSpeed === 'string') ||
      ('fanSpeedPercent' in params && typeof params.fanSpeedPercent === 'number')
    );
  }

  static getItemName(device) {
    const deviceType = this.getDeviceType(device);
    if (['AirPurifier', 'Fan', 'Hood', 'ACUnit'].includes(deviceType) && this.getItemType(device) === 'Group') {
      const members = this.getMembers(device);
      if ('fanSpeed' in members) {
        return members.fanSpeed;
      }
      throw { statusCode: 400 };
    }
    if (deviceType === 'Humidifier' && this.getItemType(device) === 'Group') {
      const members = this.getMembers(device);
      if ('humidifierFanSpeed' in members) {
        return members.humidifierFanSpeed;
      }
      throw { statusCode: 400 };
    }
    return device.id;
  }

  static convertParamsToValue(params) {
    return (params.fanSpeed || params.fanSpeedPercent).toString();
  }

  static getResponseStates(params) {
    const states = {
      currentFanSpeedPercent: params.fanSpeedPercent || Number(params.fanSpeed)
    };
    if ('fanSpeed' in params) {
      states.currentFanSpeedSetting = params.fanSpeed;
    }
    return states;
  }
}

module.exports = SetFanSpeed;

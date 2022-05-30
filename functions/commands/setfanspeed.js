const DefaultCommand = require('./default.js');
const ACUnit = require('../devices/acunit.js');

class SetFanSpeed extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.SetFanSpeed';
  }

  static validateParams(params) {
    return 'fanSpeed' in params && typeof params.fanSpeed === 'string';
  }

  static requiresItem(device) {
    return this.getDeviceType(device) === 'ACUnit';
  }

  static getItemName(item, device) {
    const deviceType = this.getDeviceType(device);
    if (deviceType === 'ACUnit') {
      const members = ACUnit.getMembers(item);
      if ('fanSpeed' in members) {
        return members.fanSpeed.name;
      }
      throw { statusCode: 400 };
    }
    return item.name;
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

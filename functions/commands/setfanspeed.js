const DefaultCommand = require('./default.js');
const ACUnit = require('../devices/acunit.js');

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
    return (params.fanSpeed || params.fanSpeedPercent).toString();
  }

  static getResponseStates(params) {
    const states = {
      currentFanSpeedPercent: Number(params.fanSpeedPercent || params.fanSpeed)
    };
    if ('fanSpeed' in params) {
      states.currentFanSpeedSetting = params.fanSpeed;
    }
    return states;
  }
}

module.exports = SetFanSpeed;

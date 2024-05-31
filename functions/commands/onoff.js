const DefaultCommand = require('./default.js');

class OnOff extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.OnOff';
  }

  static validateParams(params) {
    return 'on' in params && typeof params.on === 'boolean';
  }

  static getItemName(device) {
    const deviceType = this.getDeviceType(device);
    if (deviceType.startsWith('DynamicModes')) {
      throw { statusCode: 400 };
    }
    const members = this.getMembers(device);
    if (deviceType === 'SpecialColorLight') {
      if ('lightPower' in members) {
        return members.lightPower;
      }
      if ('lightBrightness' in members) {
        return members.lightBrightness;
      }
      throw { statusCode: 400 };
    }
    if (deviceType === 'TV') {
      if ('tvPower' in members) {
        return members.tvPower;
      }
      throw { statusCode: 400 };
    }
    if (['AirPurifier', 'Fan', 'Hood', 'ACUnit'].includes(deviceType) && this.getItemType(device) === 'Group') {
      if ('fanPower' in members) {
        return members.fanPower;
      }
      throw { statusCode: 400 };
    }
    return device.id;
  }

  static convertParamsToValue(params, _, device) {
    let on = params.on;
    if (this.isInverted(device)) {
      on = !on;
    }
    return on ? 'ON' : 'OFF';
  }

  static getResponseStates(params) {
    return {
      on: params.on
    };
  }

  static checkCurrentState(target, state, params) {
    if (target === state) {
      throw { errorCode: params.on ? 'alreadyOn' : 'alreadyOff' };
    }
  }
}

module.exports = OnOff;

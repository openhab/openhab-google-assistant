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
    const members = (device.customData && device.customData.members) || {};
    if (deviceType === 'SpecialColorLight') {
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
    if (['AirPurifier', 'Fan', 'Hood'].includes(deviceType) && this.getItemType(device) !== 'Dimmer') {
      if ('fanPower' in members) {
        return members.fanPower;
      }
      throw { statusCode: 400 };
    }
    return device.id;
  }

  static convertParamsToValue(params, _, device) {
    let on = params.on;
    if (this.isInverted(device) === true) {
      on = !on;
    }
    return on ? 'ON' : 'OFF';
  }

  static getResponseStates(params) {
    return {
      on: params.on
    };
  }
}

module.exports = OnOff;

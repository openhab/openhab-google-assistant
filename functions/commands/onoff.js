const DefaultCommand = require('./default.js');
const SpecialColorLight = require('../devices/specialcolorlight.js');
const TV = require('../devices/tv.js');

class OnOff extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.OnOff';
  }

  static validateParams(params) {
    return ('on' in params) && typeof params.on === 'boolean';
  }

  static requiresItem(device) {
    return device.customData && (
      device.customData.deviceType === 'SpecialColorLight' && device.customData.deviceType === 'TV'
    );
  }

  static getItemName(item, device) {
    if (device.customData && device.customData.deviceType === 'SpecialColorLight') {
      const members = SpecialColorLight.getMembers(item);
      if ('lightBrightness' in members) {
        return members.lightBrightness.name;
      }
      throw { statusCode: 400 };
    }
    if (device.customData && device.customData.deviceType === 'TV') {
      const members = TV.getMembers(item);
      if ('tvPower' in members) {
        return members.tvPower.name;
      }
      throw { statusCode: 400 };
    }
    return item.name;
  }

  static convertParamsToValue(params, item, device) {
    let on = params.on;
    if (device.customData && device.customData.inverted === true) {
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

const DefaultCommand = require('./default.js');
const { ERROR_CODES, GoogleAssistantError } = require('../googleErrorCodes.js');

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
      throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'OnOff not supported for dynamic modes device');
    }
    const members = this.getMembers(device);
    if (deviceType === 'SpecialColorLight') {
      if ('lightPower' in members) {
        return members.lightPower;
      }
      if ('lightBrightness' in members) {
        return members.lightBrightness;
      }
      throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'SpecialColorLight has no power or brightness member');
    }
    if (deviceType === 'TV') {
      if ('tvPower' in members) {
        return members.tvPower;
      }
      throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'TV has no power member configured');
    }
    if (['AirPurifier', 'Fan', 'Hood', 'ACUnit'].includes(deviceType) && this.getItemType(device) === 'Group') {
      if ('fanPower' in members) {
        return members.fanPower;
      }
      throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'Fan device has no power member configured');
    }
    if (deviceType === 'Humidifier' && this.getItemType(device) === 'Group') {
      if ('humidifierPower' in members) {
        return members.humidifierPower;
      }
      throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'Humidifier has no power member configured');
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
      throw new GoogleAssistantError(
        params.on ? ERROR_CODES.ALREADY_ON : ERROR_CODES.ALREADY_OFF,
        `Device is already ${params.on ? 'on' : 'off'}`
      );
    }
  }
}

module.exports = OnOff;

const DefaultCommand = require('./default.js');
const rgb2hsv = require('../utilities.js').rgb2hsv;
const kelvin2rgb = require('../utilities.js').kelvin2rgb;

class ColorAbsoluteTemperature extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.ColorAbsolute';
  }

  static validateParams(params) {
    return (
      'color' in params &&
      typeof params.color === 'object' &&
      'temperature' in params.color &&
      typeof params.color.temperature === 'number'
    );
  }

  static requiresItem(device) {
    return this.getDeviceType(device) !== 'SpecialColorLight';
  }

  static getItemName(device) {
    if (this.getDeviceType(device) === 'SpecialColorLight') {
      const members = (device.customData && device.customData.members) || {};
      if ('lightColorTemperature' in members) {
        return members.lightColorTemperature;
      }
      throw { statusCode: 400 };
    }
    return device.id;
  }

  static convertParamsToValue(params, item, device) {
    if (this.getDeviceType(device) === 'SpecialColorLight') {
      try {
        const customData = device.customData || {};
        if (customData.useKelvin) {
          return params.color.temperature.toString();
        }
        const { temperatureMinK, temperatureMaxK } = customData.colorTemperatureRange;
        return (
          100 -
          ((params.color.temperature - temperatureMinK) / (temperatureMaxK - temperatureMinK)) * 100
        ).toString();
      } catch (error) {
        return '0';
      }
    }
    const hsv = rgb2hsv(kelvin2rgb(params.color.temperature));
    const hsvArray = item.state.split(',').map((val) => Number(val));
    return [Math.round(hsv.hue * 100) / 100, Math.round(hsv.saturation * 1000) / 10, hsvArray[2]].join(',');
  }

  static getResponseStates(params) {
    return {
      color: {
        temperatureK: params.color.temperature
      }
    };
  }
}

module.exports = ColorAbsoluteTemperature;

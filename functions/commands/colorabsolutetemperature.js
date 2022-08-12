const DefaultCommand = require('./default.js');
const SpecialColorLight = require('../devices/specialcolorlight.js');
const { convertMired, convertRgbToHsv, convertKelvinToRgb } = require('../utilities.js');

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

  static requiresItem() {
    return true;
  }

  static getItemName(item, device) {
    if (this.getDeviceType(device) === 'SpecialColorLight') {
      const members = SpecialColorLight.getMembers(item);
      if ('lightColorTemperature' in members) {
        return members.lightColorTemperature.name;
      }
      throw { statusCode: 400 };
    }
    return item.name;
  }

  static convertParamsToValue(params, item, device) {
    if (this.getDeviceType(device) === 'SpecialColorLight') {
      try {
        const colorUnit = SpecialColorLight.getColorUnit(item);
        if (colorUnit === 'kelvin') {
          return params.color.temperature.toString();
        }
        if (colorUnit === 'mired') {
          return convertMired(params.color.temperature).toString();
        }
        const { temperatureMinK, temperatureMaxK } = SpecialColorLight.getAttributes(item).colorTemperatureRange;
        return (
          100 -
          ((params.color.temperature - temperatureMinK) / (temperatureMaxK - temperatureMinK)) * 100
        ).toString();
      } catch (error) {
        return '0';
      }
    }
    const hsv = convertRgbToHsv(convertKelvinToRgb(params.color.temperature));
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

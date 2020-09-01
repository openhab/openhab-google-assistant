const DefaultCommand = require('./default.js');
const SpecialColorLight = require('../devices/specialcolorlight.js');

class ColorAbsoluteTemperature extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.ColorAbsolute';
  }

  static validateParams(params) {
    return ('color' in params) && typeof params.color === 'object' &&
      ('temperature' in params.color) && typeof params.color.temperature === 'number';
  }

  static get requiresItem() {
    return true;
  }

  static getItemName(item, device) {
    if (device.customData && device.customData.deviceType === 'SpecialColorLight') {
      const members = SpecialColorLight.getMembers(item);
      if ('lightColorTemperature' in members) {
        return members.lightColorTemperature.name;
      }
      throw { statusCode: 400 };
    }
    return item.name;
  }

  static convertParamsToValue(params, item, device) {
    if (device.customData && device.customData.deviceType === 'SpecialColorLight') {
      try {
        const { temperatureMinK, temperatureMaxK } = SpecialColorLight.getAttributes(item).colorTemperatureRange;
        return ((params.color.temperature - temperatureMinK) / (temperatureMaxK - temperatureMinK) * 100).toString();
      } catch {
        return '0';
      }
    }
    const hsv = this.rgb2hsv(this.kelvin2rgb(params.color.temperature));
    const hsvArray = item.state.split(",").map((val) => Number(val));
    return [Math.round(hsv.hue * 100) / 100, Math.round(hsv.saturation * 1000) / 10, hsvArray[2]].join(',');
  }

  static getResponseStates(params) {
    return {
      color: {
        temperatureK: params.color.temperature
      }
    };
  }

  static kelvin2rgb(kelvin) {
    const temp = kelvin / 100;
    const r = temp <= 66 ? 255 : 329.698727446 * Math.pow(temp - 60, -0.1332047592);
    const g = temp <= 66 ? 99.4708025861 * Math.log(temp) - 161.1195681661 : 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
    const b = temp <= 66 ? (temp <= 19 ? 0 : 138.5177312231 * Math.log(temp - 10) - 305.0447927307) : 255;
    return {
      r: r < 0 ? 0 : r > 255 ? 255 : Math.round(r),
      g: g < 0 ? 0 : g > 255 ? 255 : Math.round(g),
      b: b < 0 ? 0 : b > 255 ? 255 : Math.round(b),
    };
  }

  static rgb2hsv({ r, g, b }) {
    r = r / 255;
    g = g / 255;
    b = b / 255;
    let v = Math.max(r, g, b), n = v - Math.min(r, g, b);
    let h = n && ((v == r) ? (g - b) / n : ((v == g) ? 2 + (b - r) / n : 4 + (r - g) / n));
    return {
      hue: 60 * (h < 0 ? h + 6 : h),
      saturation: v && n / v,
      value: v
    };
  }
}

module.exports = ColorAbsoluteTemperature;

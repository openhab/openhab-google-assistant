const DefaultDevice = require('./default.js');

class ColorLight extends DefaultDevice {
  static get type() {
    return 'action.devices.types.LIGHT';
  }

  static getTraits() {
    return [
      'action.devices.traits.OnOff',
      'action.devices.traits.Brightness',
      'action.devices.traits.ColorSetting'
    ];
  }

  static getAttributes(item) {
    const attributes = {
      colorModel: 'hsv'
    };
    const config = this.getConfig(item);
    if ('colorTemperatureRange' in config) {
      const [min, max] = config.colorTemperatureRange.split(',').map(s => Number(s.trim()));
      if (!isNaN(min) && !isNaN(max)) {
        attributes.colorTemperatureRange = {
          temperatureMinK: min,
          temperatureMaxK: max
        };
      }
    }
    return attributes;
  }

  static get requiredItemTypes() {
    return ['Color'];
  }

  static getState(item) {
    const [hue, sat, val] = item.state.split(',').map(s => Number(s.trim()));
    return {
      on: val > 0,
      brightness: val,
      color: {
        spectrumHSV: {
          hue: hue,
          saturation: sat / 100,
          value: val / 100
        }
      }
    };
  }
}

module.exports = ColorLight;

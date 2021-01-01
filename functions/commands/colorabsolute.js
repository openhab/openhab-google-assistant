const DefaultCommand = require('./default.js');

class ColorAbsolute extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.ColorAbsolute';
  }

  static validateParams(params) {
    return ('color' in params) && typeof params.color === 'object' &&
      ('spectrumHSV' in params.color) && typeof params.color.spectrumHSV === 'object';
  }

  static convertParamsToValue(params, _, device) {
    if (this.getDeviceType(device) !== 'ColorLight') {
      throw { statusCode: 400 };
    }
    const hsv = params.color.spectrumHSV;
    return [hsv.hue, hsv.saturation * 100, hsv.value * 100].join(',');
  }

  static getResponseStates(params) {
    return {
      color: {
        spectrumHsv: params.color.spectrumHSV
      }
    };
  }
}

module.exports = ColorAbsolute;

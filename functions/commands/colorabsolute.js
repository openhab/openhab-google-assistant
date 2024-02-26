const DefaultCommand = require('./default.js');

class ColorAbsolute extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.ColorAbsolute';
  }

  static validateParams(params) {
    return (
      'color' in params &&
      typeof params.color === 'object' &&
      'spectrumHSV' in params.color &&
      typeof params.color.spectrumHSV === 'object'
    );
  }

  static getItemName(device) {
    if (this.getDeviceType(device) === 'SpecialColorLight') {
      const members = this.getMembers(device);
      if ('lightColor' in members) {
        return members.lightColor;
      }
      throw { statusCode: 400 };
    }
    return device.id;
  }

  static convertParamsToValue(params, _, device) {
    if (this.getDeviceType(device) !== 'ColorLight' && this.getDeviceType(device) !== 'SpecialColorLight') {
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

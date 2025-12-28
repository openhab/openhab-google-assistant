const DefaultCommand = require('./default.js');
const { ERROR_CODES, GoogleAssistantError } = require('../googleErrorCodes.js');

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
      throw new GoogleAssistantError(
        ERROR_CODES.NOT_SUPPORTED,
        'SpecialColorLight has no lightColor member configured'
      );
    }
    return device.id;
  }

  static convertParamsToValue(params, _, device) {
    if (this.getDeviceType(device) !== 'ColorLight' && this.getDeviceType(device) !== 'SpecialColorLight') {
      throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'Device does not support color control');
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

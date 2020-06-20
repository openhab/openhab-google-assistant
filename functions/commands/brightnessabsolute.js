const DefaultCommand = require('./default.js');

class BrightnessAbsolute extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.BrightnessAbsolute';
  }

  static validateParams(params) {
    return ('brightness' in params) && typeof params.brightness === 'number';
  }

  static convertParamsToValue(params) {
    return params.brightness.toString();
  }

  static getResponseStates(params) {
    return {
      brightness: params.brightness
    };
  }
}

module.exports = BrightnessAbsolute;

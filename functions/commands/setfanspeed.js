const DefaultCommand = require('./default.js');

class SetFanSpeed extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.SetFanSpeed';
  }

  static validateParams(params) {
    return ('fanSpeed' in params) && typeof params.fanSpeed === 'string';
  }

  static convertParamsToValue(params) {
    return params.fanSpeed.toString();
  }

  static getResponseStates(params) {
    return {
      currentFanSpeedSetting: params.fanSpeed
    };
  }
}

module.exports = SetFanSpeed;

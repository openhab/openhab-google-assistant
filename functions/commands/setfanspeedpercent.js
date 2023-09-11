const DefaultCommand = require('./default.js');

class SetFanSpeedPercent extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.SetFanSpeed';
  }

  static validateParams(params) {
    return 'fanSpeedPercent' in params && typeof params.fanSpeedPercent === 'number';
  }

  static convertParamsToValue(params) {
    return params.fanSpeedPercent.toString();
  }

  static getResponseStates(params) {
    return {
      currentFanSpeedPercent: params.fanSpeedPercent
    };
  }
}

module.exports = SetFanSpeedPercent;

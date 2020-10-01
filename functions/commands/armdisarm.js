const DefaultCommand = require('./default.js');

class ArmDisarm extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.ArmDisarm';
  }

  static validateParams(params) {
    return ('arm' in params) && typeof params.arm === 'boolean';
  }

  static convertParamsToValue(params, item, device) {
    let arm = params.arm;
    if (device.customData && device.customData.inverted === true) {
      arm = !arm;
    }
    return arm ? 'ON' : 'OFF';
  }

  static getResponseStates(params) {
    return {
      isArmed: params.arm
    };
  }
}

module.exports = ArmDisarm;

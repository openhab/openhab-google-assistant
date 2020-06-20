const DefaultCommand = require('./default.js');

class OnOff extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.OnOff';
  }

  static validateParams(params) {
    return ('on' in params) && typeof params.on === 'boolean';
  }

  static convertParamsToValue(params, item, device) {
    let on = params.on;
    if (device.customData && device.customData.inverted === true) {
      on = !on;
    }
    return on ? 'ON' : 'OFF';
  }

  static getResponseStates(params) {
    return {
      on: params.on
    };
  }
}

module.exports = OnOff;

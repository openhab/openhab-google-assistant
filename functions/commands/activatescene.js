const DefaultCommand = require('./default.js');

class ActivateScene extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.ActivateScene';
  }

  static validateParams(params) {
    return (('deactivate' in params) && typeof params.deactivate === 'boolean') || !('deactivate' in params);
  }

  static convertParamsToValue(params, _, device) {
    let deactivate = params.deactivate;
    if (this.isInverted(device)) {
      deactivate = !deactivate;
    }
    return !deactivate ? 'ON' : 'OFF';
  }
}

module.exports = ActivateScene;

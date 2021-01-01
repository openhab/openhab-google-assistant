const DefaultCommand = require('./default.js');

class LockUnlock extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.LockUnlock';
  }

  static validateParams(params) {
    return ('lock' in params) && typeof params.lock === 'boolean';
  }

  static convertParamsToValue(params, _, device) {
    if (this.getItemType(device) === 'Contact') {
      throw { statusCode: 400 };
    }
    let lock = params.lock;
    if (this.isInverted(device)) {
      lock = !lock;
    }
    return lock ? 'ON' : 'OFF';
  }

  static getResponseStates(params) {
    return {
      isLocked: params.lock
    };
  }
}

module.exports = LockUnlock;

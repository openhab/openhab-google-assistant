const DefaultCommand = require('./default.js');

class LockUnlock extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.LockUnlock';
  }

  static validateParams(params) {
    return ('lock' in params) && typeof params.lock === 'boolean';
  }

  static convertParamsToValue(params, item, device) {
    if (device.customData && device.customData.itemType === 'Contact') {
      throw { statusCode: 400 };
    }
    let lock = params.lock;
    if (device.customData && device.customData.inverted === true) {
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

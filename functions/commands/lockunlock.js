const DefaultCommand = require('./default.js');
const { ERROR_CODES, GoogleAssistantError } = require('../googleErrorCodes.js');

class LockUnlock extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.LockUnlock';
  }

  static validateParams(params) {
    return 'lock' in params && typeof params.lock === 'boolean';
  }

  static convertParamsToValue(params, _, device) {
    if (this.getItemType(device) === 'Contact') {
      throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'LockUnlock is not supported for Contact items');
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

  static checkCurrentState(target, state, params) {
    if (target === state) {
      throw new GoogleAssistantError(
        params.lock ? ERROR_CODES.ALREADY_LOCKED : ERROR_CODES.ALREADY_UNLOCKED,
        `Device is already ${params.lock ? 'locked' : 'unlocked'}`
      );
    }
  }
}

module.exports = LockUnlock;

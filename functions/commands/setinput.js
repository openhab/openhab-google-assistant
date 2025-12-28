const DefaultCommand = require('./default.js');
const { ERROR_CODES, GoogleAssistantError } = require('../googleErrorCodes.js');

class SetInput extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.SetInput';
  }

  static validateParams(params) {
    return 'newInput' in params && typeof params.newInput === 'string';
  }

  static getItemName(device) {
    const members = this.getMembers(device);
    if ('tvInput' in members) {
      return members.tvInput;
    }
    throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'TV has no tvInput member configured');
  }

  static convertParamsToValue(params) {
    return params.newInput;
  }

  static getResponseStates(params) {
    return {
      currentInput: params.newInput
    };
  }
}

module.exports = SetInput;

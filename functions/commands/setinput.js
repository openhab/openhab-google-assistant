const DefaultCommand = require('./default.js');
const TV = require('../devices/tv.js');

class SetInput extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.SetInput';
  }

  static validateParams(params) {
    return ('newInput' in params) && typeof params.newInput === 'string';
  }

  static requiresItem() {
    return true;
  }

  static getItemName(item) {
    const members = TV.getMembers(item);
    if ('tvInput' in members) {
      return members.tvInput.name;
    }
    throw { statusCode: 400 };
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

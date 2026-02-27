const DefaultCommand = require('./default.js');
const TV = require('../devices/tv.js');
const { ERROR_CODES, GoogleAssistantError } = require('../googleErrorCodes.js');

class AppSelect extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.appSelect';
  }

  static validateParams(params) {
    return (
      ('newApplication' in params && typeof params.newApplication === 'string') ||
      ('newApplicationName' in params && typeof params.newApplicationName === 'string')
    );
  }

  static requiresItem() {
    return true;
  }

  static getItemName(device) {
    const members = this.getMembers(device);
    if ('tvApplication' in members) {
      return members.tvApplication;
    }
    throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'TV has no tvApplication member configured');
  }

  static convertParamsToValue(params, item) {
    const applicationMap = TV.getApplicationMap(item);
    if (params.newApplication && params.newApplication in applicationMap) {
      return params.newApplication;
    }
    const search = params.newApplicationName;
    for (const key in applicationMap) {
      if (applicationMap[key].includes(search)) {
        return key;
      }
    }
    throw new GoogleAssistantError(ERROR_CODES.NO_AVAILABLE_APP, 'Application not found in configured application map');
  }

  static getResponseStates(params, item) {
    return {
      currentApplication: this.convertParamsToValue(params, item)
    };
  }
}

module.exports = AppSelect;

const DefaultCommand = require('./default.js');
const TV = require('../devices/tv.js');

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
    throw { statusCode: 400 };
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
    throw { errorCode: 'noAvailableApp' };
  }

  static getResponseStates(params, item) {
    return {
      currentApplication: this.convertParamsToValue(params, item)
    };
  }
}

module.exports = AppSelect;

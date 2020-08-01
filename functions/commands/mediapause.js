const DefaultCommand = require('./default.js');
const TV = require('../devices/tv.js');

class MediaPause extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.mediaPause';
  }

  static get requiresItem() {
    return true;
  }

  static getItemName(item) {
    const members = TV.getMembers(item);
    if ('transport' in members) {
      return members.transport.name;
    }
    throw { statusCode: 400 };
  }

  static convertParamsToValue() {
    return 'PAUSE';
  }
}

module.exports = MediaPause;

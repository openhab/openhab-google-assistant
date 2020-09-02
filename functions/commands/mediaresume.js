const DefaultCommand = require('./default.js');
const TV = require('../devices/tv.js');

class MediaResume extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.mediaResume';
  }

  static requiresItem() {
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
    return 'PLAY';
  }
}

module.exports = MediaResume;

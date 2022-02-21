const DefaultCommand = require('./default.js');
const TV = require('../devices/tv.js');

class MediaResume extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.mediaResume';
  }

  static requiresItem() {
    return true;
  }

  static getItemNameAndState(item) {
    const members = TV.getMembers(item);
    if ('tvTransport' in members) {
      return members.tvTransport;
    }
    throw { statusCode: 400 };
  }

  static convertParamsToValue() {
    return 'PLAY';
  }
}

module.exports = MediaResume;

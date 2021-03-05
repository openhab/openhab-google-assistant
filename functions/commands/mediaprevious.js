const DefaultCommand = require('./default.js');
const TV = require('../devices/tv.js');

class MediaPrevious extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.mediaPrevious';
  }

  static requiresItem() {
    return true;
  }

  static getItemName(item) {
    const members = TV.getMembers(item);
    if ('tvTransport' in members) {
      return members.tvTransport.name;
    }
    throw { statusCode: 400 };
  }

  static convertParamsToValue() {
    return 'PREVIOUS';
  }
}

module.exports = MediaPrevious;

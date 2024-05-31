const DefaultCommand = require('./default.js');

class MediaPause extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.mediaPause';
  }

  static getItemName(device) {
    const members = this.getMembers(device);
    if ('tvTransport' in members) {
      return members.tvTransport;
    }
    throw { statusCode: 400 };
  }

  static convertParamsToValue() {
    return 'PAUSE';
  }
}

module.exports = MediaPause;

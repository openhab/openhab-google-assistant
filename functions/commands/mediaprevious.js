const DefaultCommand = require('./default.js');

class MediaPrevious extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.mediaPrevious';
  }

  static getItemName(device) {
    const members = (device.customData && device.customData.members) || {};
    if ('tvTransport' in members) {
      return members.tvTransport;
    }
    throw { statusCode: 400 };
  }

  static convertParamsToValue() {
    return 'PREVIOUS';
  }
}

module.exports = MediaPrevious;

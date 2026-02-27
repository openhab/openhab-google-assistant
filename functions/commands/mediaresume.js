const DefaultCommand = require('./default.js');
const { ERROR_CODES, GoogleAssistantError } = require('../googleErrorCodes.js');

class MediaResume extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.mediaResume';
  }

  static getItemName(device) {
    const members = this.getMembers(device);
    if ('tvTransport' in members) {
      return members.tvTransport;
    }
    throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'TV has no tvTransport member configured');
  }

  static convertParamsToValue() {
    return 'PLAY';
  }
}

module.exports = MediaResume;

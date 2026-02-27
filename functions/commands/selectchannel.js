const DefaultCommand = require('./default.js');
const TV = require('../devices/tv.js');
const { ERROR_CODES, GoogleAssistantError } = require('../googleErrorCodes.js');

class SelectChannel extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.selectChannel';
  }

  static validateParams(params) {
    return (
      ('channelCode' in params && typeof params.channelCode === 'string') ||
      ('channelName' in params && typeof params.channelName === 'string') ||
      ('channelNumber' in params && typeof params.channelNumber === 'string')
    );
  }

  static requiresItem() {
    return true;
  }

  static getItemName(device) {
    const members = this.getMembers(device);
    if ('tvChannel' in members) {
      return members.tvChannel;
    }
    throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'TV has no tvChannel member configured');
  }

  static convertParamsToValue(params, item) {
    const channelMap = TV.getChannelMap(item);
    if (params.channelNumber && params.channelNumber in channelMap) {
      return params.channelNumber;
    }
    const search = params.channelName || params.channelCode;
    for (const number in channelMap) {
      if (channelMap[number].some((name) => name.toLowerCase() === search.toLowerCase())) {
        return number;
      }
    }
    throw new GoogleAssistantError(
      ERROR_CODES.NO_AVAILABLE_CHANNEL,
      'Requested channel is not available for this device'
    );
  }

  static getResponseStates(params, item) {
    return {
      channelNumber: this.convertParamsToValue(params, item)
    };
  }
}

module.exports = SelectChannel;

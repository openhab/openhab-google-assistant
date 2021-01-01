const DefaultCommand = require('./default.js');
const TV = require('../devices/tv.js');

class SelectChannel extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.selectChannel';
  }

  static validateParams(params) {
    return (('channelCode' in params) && typeof params.channelCode === 'string') ||
      (('channelName' in params) && typeof params.channelName === 'string') ||
      (('channelNumber' in params) && typeof params.channelNumber === 'string');
  }

  static requiresItem() {
    return true;
  }

  static getItemName(item) {
    const members = TV.getMembers(item);
    if ('tvChannel' in members) {
      return members.tvChannel.name;
    }
    throw { statusCode: 400 };
  }

  static convertParamsToValue(params, item) {
    if (params.channelNumber) {
      return params.channelNumber;
    }
    const search = params.channelName || params.channelCode;
    const channelMap = TV.getChannelMap(item);
    for (const number in channelMap) {
      if (channelMap[number].includes(search)) {
        return number;
      }
    }
  }

  static getResponseStates(params, item) {
    return {
      channelNumber: this.convertParamsToValue(params, item)
    };
  }
}

module.exports = SelectChannel;

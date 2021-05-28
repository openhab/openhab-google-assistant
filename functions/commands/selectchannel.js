const DefaultCommand = require('./default.js');
const TV = require('../devices/tv.js');

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
    const members = (device.customData && device.customData.members) || {};
    if ('tvChannel' in members) {
      return members.tvChannel;
    }
    throw { statusCode: 400 };
  }

  static convertParamsToValue(params, item) {
    const channelMap = TV.getChannelMap(item);
    if (params.channelNumber && params.channelNumber in channelMap) {
      return params.channelNumber;
    }
    const search = params.channelName || params.channelCode;
    for (const number in channelMap) {
      if (channelMap[number].includes(search)) {
        return number;
      }
    }
    throw { errorCode: 'noAvailableChannel' };
  }

  static getResponseStates(params, item) {
    return {
      channelNumber: this.convertParamsToValue(params, item)
    };
  }
}

module.exports = SelectChannel;

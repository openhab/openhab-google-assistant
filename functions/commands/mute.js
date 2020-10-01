const DefaultCommand = require('./default.js');
const TV = require('../devices/tv.js');

class Mute extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.mute';
  }

  static validateParams(params) {
    return ('mute' in params) && typeof params.mute === 'boolean';
  }

  static requiresItem(device) {
    return !!device.customData && device.customData.deviceType === 'TV';
  }

  static getItemName(item, device) {
    if (device.customData && device.customData.deviceType === 'TV') {
      const members = TV.getMembers(item);
      if ('tvMute' in members) {
        return members.tvMute.name;
      }
      if ('tvVolume' in members) {
        return members.tvVolume.name;
      }
      throw { statusCode: 400 };
    }
    return item.name;
  }

  static convertParamsToValue(params, item, device) {
    let itemType = device.customData && device.customData.itemType;
    if (device.customData && device.customData.deviceType === 'TV') {
      const members = TV.getMembers(item);
      if ('tvMute' in members) {
        itemType = 'Switch';
      } else if ('tvVolume' in members) {
        itemType = 'Dimmer';
      }
    }
    let mute = params.mute;
    if (itemType !== 'Switch') {
      return mute ? '0' : undefined;
    }
    if (device.customData && device.customData.inverted === true) {
      mute = !mute;
    }
    return mute ? 'ON' : 'OFF';
  }

  static getResponseStates(params) {
    return {
      isMuted: params.mute
    };
  }
}

module.exports = Mute;

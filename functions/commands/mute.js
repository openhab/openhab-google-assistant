const DefaultCommand = require('./default.js');

class Mute extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.mute';
  }

  static validateParams(params) {
    return 'mute' in params && typeof params.mute === 'boolean';
  }

  static getItemName(device) {
    if (this.getDeviceType(device) === 'TV') {
      const members = (device.customData && device.customData.members) || {};
      if ('tvMute' in members) {
        return members.tvMute;
      }
      if ('tvVolume' in members) {
        return members.tvVolume;
      }
      throw { statusCode: 400 };
    }
    return device.id;
  }

  static convertParamsToValue(params, item, device) {
    let itemType = this.getItemType(device);
    if (this.getDeviceType(device) === 'TV') {
      const members = (device.customData && device.customData.members) || {};
      if ('tvMute' in members) {
        itemType = 'Switch';
      }
    }
    let mute = params.mute;
    if (itemType !== 'Switch') {
      return mute ? '0' : undefined;
    }
    if (this.isInverted(device) === true) {
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

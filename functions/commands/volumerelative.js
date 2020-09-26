const DefaultCommand = require('./default.js');
const TV = require('../devices/tv.js');

class VolumeRelative extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.volumeRelative';
  }

  static validateParams(params) {
    return ('volumeRelativeLevel' in params) && typeof params.volumeRelativeLevel === 'number';
  }

  static requiresItem() {
    return true;
  }

  static getItemName(item, device) {
    if (device.customData && device.customData.deviceType === 'TV') {
      const members = TV.getMembers(item);
      if ('tvVolume' in members) {
        return members.tvVolume.name;
      }
      throw { statusCode: 400 };
    }
    return item.name;
  }

  static convertParamsToValue(params, item, device) {
    let state = item.state;
    if (device.customData && device.customData.deviceType === 'TV') {
      const members = TV.getMembers(item);
      if ('tvVolume' in members) {
        state = members.tvVolume.state;
      } else {
        throw { statusCode: 400 };
      }
    }
    let level = parseInt(state) + params.volumeRelativeLevel;
    return (level < 0 ? 0 : level > 100 ? 100 : level).toString();
  }

  static getResponseStates(params, item) {
    const state = parseInt(this.convertParamsToValue(params, item));
    return {
      currentVolume: state,
      isMuted: state === 0
    };
  }
}

module.exports = VolumeRelative;

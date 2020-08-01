const DefaultCommand = require('./default.js');
const TV = require('../devices/tv.js');

class VolumeRelative extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.volumeRelative';
  }

  static validateParams(params) {
    return ('volumeRelativeLevel' in params) && typeof params.volumeRelativeLevel === 'number';
  }

  static get requiresItem() {
    return true;
  }

  static getItemName(item) {
    if (item.metadata && item.metadata.ga && item.metadata.ga.value.toLowerCase() === 'tv') {
      const members = TV.getMembers(item);
      if ('volume' in members) {
        return members.volume.name;
      }
      throw { statusCode: 400 };
    }
    return item.name;
  }

  static convertParamsToValue(params, item) {
    let state = item.state;
    if (item.metadata && item.metadata.ga && item.metadata.ga.value.toLowerCase() === 'tv') {
      const members = TV.getMembers(item);
      if ('volume' in members) {
        state = members.volume.state;
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

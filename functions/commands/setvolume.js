const DefaultCommand = require('./default.js');
const TV = require('../devices/tv.js');

class SetVolume extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.setVolume';
  }

  static validateParams(params) {
    return ('volumeLevel' in params) && typeof params.volumeLevel === 'number';
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

  static convertParamsToValue(params) {
    return params.volumeLevel.toString();
  }

  static getResponseStates(params) {
    return {
      currentVolume: params.volumeLevel,
      isMuted: params.volumeLevel === 0
    };
  }
}

module.exports = SetVolume;

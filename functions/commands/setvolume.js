const DefaultCommand = require('./default.js');
const TV = require('../devices/tv.js');

class SetVolume extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.setVolume';
  }

  static validateParams(params) {
    return ('volumeLevel' in params) && typeof params.volumeLevel === 'number';
  }

  static requiresItem(device) {
    return this.getDeviceType(device) === 'TV';
  }

  static getItemName(item, device) {
    if (this.getDeviceType(device) === 'TV') {
      const members = TV.getMembers(item);
      if ('tvVolume' in members) {
        return members.tvVolume.name;
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
      currentVolume: params.volumeLevel
    };
  }
}

module.exports = SetVolume;

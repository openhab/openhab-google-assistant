const DefaultCommand = require('./default.js');

class SetVolume extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.setVolume';
  }

  static validateParams(params) {
    return 'volumeLevel' in params && typeof params.volumeLevel === 'number';
  }

  static getItemName(device) {
    if (this.getDeviceType(device) === 'TV') {
      const members = (device.customData && device.customData.members) || {};
      if ('tvVolume' in members) {
        return members.tvVolume;
      }
      throw { statusCode: 400 };
    }
    return device.id;
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

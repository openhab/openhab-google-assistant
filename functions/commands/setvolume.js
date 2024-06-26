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
      const members = this.getMembers(device);
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

  static checkCurrentState(target, state) {
    if (target === state) {
      throw {
        errorCode: state === '100' ? 'volumeAlreadyMax' : state === '0' ? 'volumeAlreadyMin' : 'alreadyInState'
      };
    }
  }
}

module.exports = SetVolume;

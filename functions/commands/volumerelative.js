const DefaultCommand = require('./default.js');
const TV = require('../devices/tv.js');

class VolumeRelative extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.volumeRelative';
  }

  static validateParams(params) {
    return 'relativeSteps' in params && typeof params.relativeSteps === 'number';
  }

  static requiresItem() {
    return true;
  }

  static getItemNameAndState(item, device) {
    if (this.getDeviceType(device) === 'TV') {
      const members = TV.getMembers(item);
      if ('tvVolume' in members) {
        return members.tvVolume;
      }
      throw { statusCode: 400 };
    }
    return super.getItemNameAndState(item);
  }

  static convertParamsToValue(params, item, device) {
    let state = item.state;
    if (this.getDeviceType(device) === 'TV') {
      const members = TV.getMembers(item);
      if ('tvVolume' in members) {
        state = members.tvVolume.state;
      } else {
        throw { statusCode: 400 };
      }
    }
    let level = parseInt(state) + params.relativeSteps;
    return (level < 0 ? 0 : level > 100 ? 100 : level).toString();
  }

  static getResponseStates(params, item, device) {
    return {
      currentVolume: parseInt(this.convertParamsToValue(params, item, device))
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

module.exports = VolumeRelative;

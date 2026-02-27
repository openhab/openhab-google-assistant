const DefaultCommand = require('./default.js');
const { ERROR_CODES, GoogleAssistantError } = require('../googleErrorCodes.js');

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
      throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'TV has no tvVolume member configured');
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
      const errorCode =
        state === '100'
          ? ERROR_CODES.VOLUME_ALREADY_MAX
          : state === '0'
            ? ERROR_CODES.VOLUME_ALREADY_MIN
            : ERROR_CODES.ALREADY_IN_STATE;
      const message =
        state === '100'
          ? 'Volume is already at maximum'
          : state === '0'
            ? 'Volume is already at minimum'
            : 'Volume is already at target level';
      throw new GoogleAssistantError(errorCode, message);
    }
  }
}

module.exports = SetVolume;

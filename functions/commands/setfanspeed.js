const DefaultCommand = require('./default.js');
const { ERROR_CODES, GoogleAssistantError } = require('../googleErrorCodes.js');

class SetFanSpeed extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.SetFanSpeed';
  }

  static validateParams(params) {
    return (
      ('fanSpeed' in params && typeof params.fanSpeed === 'string') ||
      ('fanSpeedPercent' in params && typeof params.fanSpeedPercent === 'number')
    );
  }

  static getItemName(device) {
    const deviceType = this.getDeviceType(device);
    if (['AirPurifier', 'Fan', 'Hood', 'ACUnit'].includes(deviceType) && this.getItemType(device) === 'Group') {
      const members = this.getMembers(device);
      if ('fanSpeed' in members) {
        return members.fanSpeed;
      }
      throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'Device has no fanSpeed member configured');
    }
    if (deviceType === 'Humidifier' && this.getItemType(device) === 'Group') {
      const members = this.getMembers(device);
      if ('humidifierFanSpeed' in members) {
        return members.humidifierFanSpeed;
      }
      throw new GoogleAssistantError(
        ERROR_CODES.NOT_SUPPORTED,
        'Humidifier has no humidifierFanSpeed member configured'
      );
    }
    return device.id;
  }

  static convertParamsToValue(params) {
    return (params.fanSpeed || params.fanSpeedPercent).toString();
  }

  static getResponseStates(params) {
    const states = {
      currentFanSpeedPercent: params.fanSpeedPercent || Number(params.fanSpeed)
    };
    if ('fanSpeed' in params) {
      states.currentFanSpeedSetting = params.fanSpeed;
    }
    return states;
  }

  static checkCurrentState(target, state) {
    const targetNum = parseFloat(target);
    const stateNum = parseFloat(state);

    if (!isNaN(targetNum) && !isNaN(stateNum)) {
      if (Math.abs(targetNum - stateNum) < 1) {
        let errorCode = ERROR_CODES.ALREADY_IN_STATE;
        if (stateNum >= 100) errorCode = ERROR_CODES.MAX_SPEED_REACHED;
        else if (stateNum <= 0) errorCode = ERROR_CODES.MIN_SPEED_REACHED;
        throw new GoogleAssistantError(errorCode, 'Fan speed is already at the requested level');
      }
      return;
    }

    if (typeof target === 'string' && typeof state === 'string' && target === state) {
      throw new GoogleAssistantError(ERROR_CODES.ALREADY_IN_STATE, 'Fan speed is already at the requested setting');
    }
  }
}

module.exports = SetFanSpeed;

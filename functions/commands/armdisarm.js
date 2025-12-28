const DefaultCommand = require('./default.js');
const SecuritySystem = require('../devices/securitysystem.js');
const { ERROR_CODES, GoogleAssistantError } = require('../googleErrorCodes.js');

class ArmDisarm extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.ArmDisarm';
  }

  static validateParams(params) {
    return 'arm' in params && typeof params.arm === 'boolean';
  }

  static convertParamsToValue(params, _, device) {
    if (params.armLevel && this.getDeviceType(device) === 'SecuritySystem') {
      return params.armLevel;
    }
    let arm = params.arm;
    if (this.isInverted(device)) {
      arm = !arm;
    }
    return arm ? 'ON' : 'OFF';
  }

  static getItemName(device, params) {
    if (this.getDeviceType(device) === 'SecuritySystem') {
      const members = this.getMembers(device);
      if (params.armLevel) {
        if (SecuritySystem.armLevelMemberName in members) {
          return members[SecuritySystem.armLevelMemberName];
        }
        throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'SecuritySystem has no armLevel member configured');
      }
      if (SecuritySystem.armedMemberName in members) {
        return members[SecuritySystem.armedMemberName];
      }
      throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'SecuritySystem has no armed member configured');
    }
    return device.id;
  }

  static requiresItem() {
    return true;
  }

  static bypassPin(device, params) {
    return !!(device.customData && device.customData.pinOnDisarmOnly && (params.armLevel || params.arm));
  }

  static getResponseStates(params) {
    const response = {
      isArmed: params.arm
    };
    if (params.armLevel) {
      response.currentArmLevel = params.armLevel;
    }
    return response;
  }

  static get requiresUpdateValidation() {
    return true;
  }

  static checkCurrentState(target, state, params) {
    if (target === state) {
      const errorCode = params.armLevel
        ? ERROR_CODES.ALREADY_IN_STATE
        : params.arm
          ? ERROR_CODES.ALREADY_ARMED
          : ERROR_CODES.ALREADY_DISARMED;
      const message = params.armLevel
        ? 'Security system is already in the requested state'
        : params.arm
          ? 'Security system is already armed'
          : 'Security system is already disarmed';
      throw new GoogleAssistantError(errorCode, message);
    }
  }

  static validateUpdate(params, item, device) {
    if (this.getDeviceType(device) === 'SecuritySystem') {
      const members = SecuritySystem.getMembers(item);
      const isCurrentlyArmed =
        members[SecuritySystem.armedMemberName].state === (this.isInverted(device) ? 'OFF' : 'ON');
      const currentLevel =
        SecuritySystem.armLevelMemberName in members ? members[SecuritySystem.armLevelMemberName].state : '';
      const armStatusSuccessful = params.arm === isCurrentlyArmed;
      const armLevelSuccessful = params.armLevel ? params.armLevel === currentLevel : true;
      if (!armStatusSuccessful || !armLevelSuccessful) {
        if (!params.arm) {
          throw new GoogleAssistantError(ERROR_CODES.DISARM_FAILURE, 'Failed to disarm security system');
        } else {
          const report = SecuritySystem.getStatusReport(item, members);
          if (report.length) {
            return {
              ids: [device.id],
              status: 'EXCEPTIONS',
              states: { online: true, currentStatusReport: report, ...SecuritySystem.getState(item) }
            };
          }
          throw new GoogleAssistantError(ERROR_CODES.ARM_FAILURE, 'Failed to arm security system');
        }
      }
    } else {
      if (params.arm !== (item.state === (this.isInverted(device) ? 'OFF' : 'ON'))) {
        throw new GoogleAssistantError(
          params.arm ? ERROR_CODES.ARM_FAILURE : ERROR_CODES.DISARM_FAILURE,
          params.arm ? 'Failed to arm security system' : 'Failed to disarm security system'
        );
      }
    }
  }
}

module.exports = ArmDisarm;

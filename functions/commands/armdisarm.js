const DefaultCommand = require('./default.js');
const SecuritySystem = require('../devices/securitysystem.js');

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
        throw { statusCode: 400 };
      }
      if (SecuritySystem.armedMemberName in members) {
        return members[SecuritySystem.armedMemberName];
      }
      throw { statusCode: 400 };
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
      throw { errorCode: params.armLevel ? 'alreadyInState' : params.arm ? 'alreadyArmed' : 'alreadyDisarmed' };
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
          throw { errorCode: 'disarmFailure' };
        } else {
          const report = SecuritySystem.getStatusReport(item, members);
          if (report.length) {
            return {
              ids: [device.id],
              status: 'EXCEPTIONS',
              states: { online: true, currentStatusReport: report, ...SecuritySystem.getState(item) }
            };
          }
          throw { errorCode: 'armFailure' };
        }
      }
    } else {
      if (params.arm !== (item.state === (this.isInverted(device) ? 'OFF' : 'ON'))) {
        throw { errorCode: params.arm ? 'armFailure' : 'disarmFailure' };
      }
    }
  }
}

module.exports = ArmDisarm;

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

  static getItemName(item, device, params) {
    if (this.getDeviceType(device) === 'SecuritySystem') {
      const members = SecuritySystem.getMembers(item);
      if (params.armLevel) {
        if (SecuritySystem.armLevelMemberName in members) {
          return members[SecuritySystem.armLevelMemberName].name;
        }
        throw { statusCode: 400 };
      }
      if (SecuritySystem.armedMemberName in members) {
        return members[SecuritySystem.armedMemberName].name;
      }
      throw { statusCode: 400 };
    }
    return item.name;
  }

  static requiresItem() {
    return true;
  }

  static bypassPin(device, params) {
    return device.customData.pinOnDisarmOnly && (params.armLevel || params.arm);
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

  static shouldValidateStateChange() {
    return true;
  }

  static shouldGetLatestState() {
    return true;
  }

  static validateStateChange(params, item, device) {
    let isCurrentlyArmed;
    let currentLevel;

    if (this.getDeviceType(device) === 'SecuritySystem') {
      const members = SecuritySystem.getMembers(item);
      isCurrentlyArmed =
        (SecuritySystem.armedMemberName in members && members[SecuritySystem.armedMemberName].state) ===
        (this.isInverted(device) ? 'OFF' : 'ON');
      currentLevel =
        (SecuritySystem.armLevelMemberName in members && members[SecuritySystem.armLevelMemberName].state) || undefined;
    } else {
      isCurrentlyArmed = item.state === (this.isInverted(device) ? 'OFF' : 'ON');
    }

    if (params.armLevel && this.getDeviceType(device) === 'SecuritySystem') {
      if (params.arm && isCurrentlyArmed && params.armLevel === currentLevel) {
        throw { errorCode: 'alreadyInState' };
      }
      return;
    }

    if (params.arm && isCurrentlyArmed) {
      throw { errorCode: 'alreadyArmed' };
    }

    if (!params.arm && !isCurrentlyArmed) {
      throw { errorCode: 'alreadyDisarmed' };
    }
  }

  static checkUpdateFailed(params, item, device) {
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
          let report = SecuritySystem.getStatusReport(item, members);
          if (report.length) {
            let response = {
              ids: [device.id],
              status: 'EXCEPTIONS',
              states: this.getNewState(params, item, device)
            };
            response.states.currentStatusReport = report;
            return response;
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

  static getNewState(params, item, device) {
    const members = SecuritySystem.getMembers(item);
    let response = {
      online: true,
      isArmed: members[SecuritySystem.armedMemberName].state === (this.isInverted(device) ? 'OFF' : 'ON')
    };
    if (params.armLevel) {
      response.currentArmLevel = members[SecuritySystem.armLevelMemberName].state;
    }
    return response;
  }
}

module.exports = ArmDisarm;

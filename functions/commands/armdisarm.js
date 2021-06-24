const DefaultCommand = require('./default.js');
const SecuritySystem = require('../devices/securitysystem.js');

class ArmDisarm extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.ArmDisarm';
  }

  static validateParams(params) {
    return 'arm' in params && typeof params.arm === 'boolean';
  }

  static convertParamsToValue(params, item, device) {
    let arm = params.arm;
    let armLevel = params.armLevel;

    if (armLevel && item.type === 'Group') {
      return armLevel;
    }
    if (this.isInverted(device)) {
      arm = !arm;
    }
    return arm ? 'ON' : 'OFF';
  }

  static getItemName(item, _, params) {
    return SecuritySystem.getMemberToSendArmCommand(item, params);
  }

  static requiresItem() {
    return true;
  }

  static getResponseStates(params) {
    let response = {
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
    const members = SecuritySystem.getMembers(item);
    const isCurrentlyArmed =
      (item.type === 'Switch' ? item.state : members[SecuritySystem.armedMemberName].state) === 'ON';
    const currentLevel =
      item.type === 'Switch'
        ? undefined
        : SecuritySystem.armLevelMemberName in members && members[SecuritySystem.armLevelMemberName].state;

    //ArmLevel not supported for legacy Switch type
    if (params.armLevel && item.type === 'Group') {
      const alreadyArmedAtThisLevel = params.arm && isCurrentlyArmed && params.armLevel === currentLevel;
      if (alreadyArmedAtThisLevel) {
        return this.getErrorMessage(device, 'alreadyInState');
      }
      return;
    }

    if (params.arm && isCurrentlyArmed) {
      return this.getErrorMessage(device, 'alreadyArmed');
    }

    if (!params.arm && !isCurrentlyArmed) {
      return this.getErrorMessage(device, 'alreadyDisarmed');
    }
  }

  static getErrorMessage(device, errorCode) {
    return {
      ids: [device.id],
      status: 'ERROR',
      errorCode
    };
  }

  static checkUpdateFailed(params, item, device) {
    const members = SecuritySystem.getMembers(item);
    const isCurrentlyArmed =
      (item.type === 'Switch' ? item.state : members[SecuritySystem.armedMemberName].state) === 'ON';
    const currentLevel =
      item.type === 'Switch'
        ? undefined
        : SecuritySystem.armLevelMemberName in members
        ? members[SecuritySystem.armLevelMemberName].state
        : '';

    const armStatusSuccessful = params.arm === isCurrentlyArmed;
    const armLevelSuccessful =
      item.type === 'Switch' ? true : params.armLevel ? params.armLevel === currentLevel : true;

    if (armStatusSuccessful && armLevelSuccessful) {
      return;
    }

    return this.getErrorMessage(device, params.arm ? 'armFailure' : 'disarmFailure');
  }

  static getNewState(params, item) {
    const members = SecuritySystem.getMembers(item);
    let response = {
      online: true,
      isArmed: (item.type === 'Switch' ? item.state : members[SecuritySystem.armedMemberName].state) === 'ON'
    };
    if (params.armLevel && item.type === 'Group') {
      response.currentArmLevel = members[SecuritySystem.armLevelMemberName].state;
    }
    return response;
  }
}

module.exports = ArmDisarm;

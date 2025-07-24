const DefaultCommand = require('./default.js');

class Dock extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.Dock';
  }

  static validateParams() {
    return true; // No required parameters for dock command
  }

  static getItemName(device) {
    if (this.getDeviceType(device) === 'Vacuum') {
      const members = this.getMembers(device);
      if ('vacuumDock' in members) {
        return members.vacuumDock;
      }
      throw { statusCode: 400 };
    }
    return device.id;
  }

  static convertParamsToValue() {
    return 'ON'; // Dock command always sends ON to dock the vacuum
  }

  static getResponseStates() {
    return {
      isDocked: true,
      isRunning: false,
      isPaused: false
    };
  }

  static checkCurrentState(target, state) {
    if (target === state) {
      throw { errorCode: 'alreadyDocked' };
    }
  }
}

module.exports = Dock;

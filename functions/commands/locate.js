const DefaultCommand = require('./default.js');
const { ERROR_CODES, GoogleAssistantError } = require('../googleErrorCodes.js');

class Locate extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.Locate';
  }

  static validateParams() {
    return true; // No required parameters for locate command
  }

  static getItemName(device) {
    if (this.getDeviceType(device) === 'Vacuum') {
      const members = this.getMembers(device);
      if ('vacuumLocate' in members) {
        return members.vacuumLocate;
      }
      throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'Vacuum has no vacuumLocate member configured');
    }
    return device.id;
  }

  static convertParamsToValue() {
    return 'ON'; // Locate command sends ON to trigger the locate function
  }

  static checkCurrentState() {
    return;
  }
}

module.exports = Locate;

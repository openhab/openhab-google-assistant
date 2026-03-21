const DefaultCommand = require('./default.js');
const { ERROR_CODES, GoogleAssistantError } = require('../googleErrorCodes.js');

class OpenClose extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.OpenClose';
  }

  static validateParams(params) {
    return 'openPercent' in params && typeof params.openPercent === 'number';
  }

  static getItemName(device) {
    const members = this.getMembers(device);
    // If device is a group with shutterPosition member, use that
    if ('shutterPosition' in members) {
      return members.shutterPosition;
    }
    // Otherwise use the device itself (single item case)
    return device.id;
  }

  static convertParamsToValue(params, _, device) {
    const itemType = this.getItemType(device);
    const members = this.getMembers(device);

    // Determine the actual item type to work with
    let actualItemType = itemType;
    if (itemType === 'Group' && 'shutterPosition' in members) {
      // For group shutters, use the stored shutterPosition item type from customData
      actualItemType = device.customData?.shutterPositionItemType || 'Rollershutter';
    }

    if (actualItemType === 'Contact') {
      throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'Contact items cannot be used with OpenClose command');
    }

    let openPercent = params.openPercent;
    if (this.isInverted(device)) {
      openPercent = 100 - openPercent;
    }

    if (actualItemType === 'Rollershutter') {
      return openPercent === 0 ? 'DOWN' : openPercent === 100 ? 'UP' : (100 - openPercent).toString();
    }
    if (actualItemType === 'Switch') {
      return openPercent === 0 ? 'OFF' : 'ON';
    }
    return openPercent.toString();
  }

  static getResponseStates(params) {
    return {
      openPercent: params.openPercent
    };
  }

  static checkCurrentState(target, state, params) {
    const adjustedTarget = target === 'DOWN' ? '100' : target === 'UP' ? '0' : target;
    if (adjustedTarget === state) {
      throw new GoogleAssistantError(
        params.openPercent === 0 ? ERROR_CODES.ALREADY_CLOSED : ERROR_CODES.ALREADY_OPEN,
        `Device is already ${params.openPercent === 0 ? 'closed' : 'open'}`
      );
    }
  }
}

module.exports = OpenClose;

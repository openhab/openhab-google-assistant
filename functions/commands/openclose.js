const DefaultCommand = require('./default.js');

class OpenClose extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.OpenClose';
  }

  static validateParams(params) {
    return ('openPercent' in params) && typeof params.openPercent === 'number';
  }

  static convertParamsToValue(params, item, device) {
    if (device.customData && device.customData.itemType === 'Contact') {
      throw { statusCode: 400 };
    }
    let openPercent = params.openPercent;
    if (device.customData && device.customData.inverted === true) {
      openPercent = 100 - openPercent;
    }
    if (device.customData && device.customData.itemType === 'Rollershutter') {
      return openPercent === 0 ? 'DOWN' : openPercent === 100 ? 'UP' : (100 - openPercent).toString();
    }
    if (device.customData && device.customData.itemType === 'Switch') {
      return openPercent === 0 ? 'OFF' : 'ON';
    }
    return openPercent.toString();
  }

  static getResponseStates(params) {
    return {
      openPercent: params.openPercent
    };
  }
}

module.exports = OpenClose;

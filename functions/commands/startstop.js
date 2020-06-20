const DefaultCommand = require('./default.js');

class StartStop extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.StartStop';
  }

  static validateParams(params) {
    return ('start' in params) && typeof params.start === 'boolean';
  }

  static convertParamsToValue(params, item, device) {
    if (device.customData && device.customData.itemType === 'Contact') {
      throw { statusCode: 400 };
    }
    let value = params.start ? 'MOVE' : 'STOP';
    // item can not handle StartStop --> we will send "ON" / "OFF"
    if (device.customData && device.customData.itemType !== 'Rollershutter') {
      value = params.start ? 'ON' : 'OFF';
    }
    return value;
  }

  static getResponseStates(params) {
    return {
      isRunning: params.start,
      isPaused: !params.start
    };
  }
}

module.exports = StartStop;

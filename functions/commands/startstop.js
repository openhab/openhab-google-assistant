const DefaultCommand = require('./default.js');

class StartStop extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.StartStop';
  }

  static validateParams(params) {
    return ('start' in params) && typeof params.start === 'boolean';
  }

  static convertParamsToValue(params, _, device) {
    const itemType = this.getItemType(device);
    if (itemType === 'Contact') {
      throw { statusCode: 400 };
    }
    if (itemType === 'Rollershutter') {
      return params.start ? 'MOVE' : 'STOP';
    }
    return params.start ? 'ON' : 'OFF';
  }

  static getResponseStates(params) {
    return {
      isRunning: params.start,
      isPaused: !params.start
    };
  }
}

module.exports = StartStop;

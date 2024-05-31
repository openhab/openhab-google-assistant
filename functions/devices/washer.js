const StartStopSwitch = require('./startstopswitch.js');

class Washer extends StartStopSwitch {
  static get type() {
    return 'action.devices.types.WASHER';
  }
}

module.exports = Washer;

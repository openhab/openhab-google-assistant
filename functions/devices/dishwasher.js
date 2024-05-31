const StartStopSwitch = require('./startstopswitch.js');

class Dishwasher extends StartStopSwitch {
  static get type() {
    return 'action.devices.types.DISHWASHER';
  }
}

module.exports = Dishwasher;

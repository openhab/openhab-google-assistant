const StartStopSwitch = require('./startstopswitch.js');

class SimpleVacuum extends StartStopSwitch {
  static get type() {
    return 'action.devices.types.VACUUM';
  }
}

module.exports = SimpleVacuum;

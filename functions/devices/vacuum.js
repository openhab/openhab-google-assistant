const StartStopSwitch = require('./startstopswitch.js');

class Vacuum extends StartStopSwitch {
  static get type() {
    return 'action.devices.types.VACUUM';
  }
}

module.exports = Vacuum;

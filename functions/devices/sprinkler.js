const StartStopSwitch = require('./startstopswitch.js');

class Sprinkler extends StartStopSwitch {
  static get type() {
    return 'action.devices.types.SPRINKLER';
  }
}

module.exports = Sprinkler;

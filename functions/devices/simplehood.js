const Switch = require('./switch.js');

class SimpleHood extends Switch {
  static get type() {
    return 'action.devices.types.HOOD';
  }
}

module.exports = SimpleHood;

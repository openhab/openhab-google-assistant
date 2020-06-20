const Switch = require('./switch.js');

class SimpleAirPurifier extends Switch {
  static get type() {
    return 'action.devices.types.AIRPURIFIER'
  }
}

module.exports = SimpleAirPurifier;

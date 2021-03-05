const Switch = require('./switch.js');

class SimpleFan extends Switch {
  static get type() {
    return 'action.devices.types.FAN';
  }
}

module.exports = SimpleFan;

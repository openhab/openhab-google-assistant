const Switch = require('./switch.js');

class SimpleLight extends Switch {
  static get type() {
    return 'action.devices.types.LIGHT';
  }
}

module.exports = SimpleLight;

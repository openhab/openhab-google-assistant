const ModesDevice = require('./modesdevice.js');

class ModeLight extends ModesDevice {
  static get type() {
    return 'action.devices.types.LIGHT';
  }
}

module.exports = ModeLight;

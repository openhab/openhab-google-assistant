const ModesDevice = require('./modesdevice.js');

class ModesLight extends ModesDevice {
  static get type() {
    return 'action.devices.types.LIGHT';
  }
}

module.exports = ModesLight;

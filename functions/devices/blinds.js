const OpenCloseDevice = require('./openclosedevice.js');

class Blinds extends OpenCloseDevice {
  static get type() {
    return 'action.devices.types.BLINDS';
  }
}

module.exports = Blinds;

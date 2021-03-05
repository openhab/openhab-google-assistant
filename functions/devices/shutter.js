const OpenCloseDevice = require('./openclosedevice.js');

class Shutter extends OpenCloseDevice {
  static get type() {
    return 'action.devices.types.SHUTTER';
  }
}

module.exports = Shutter;

const OpenCloseDevice = require('./openclosedevice.js');

class Awning extends OpenCloseDevice {
  static get type() {
    return 'action.devices.types.AWNING';
  }
}

module.exports = Awning;

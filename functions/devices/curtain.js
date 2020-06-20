const OpenCloseDevice = require('./openclosedevice.js');

class Curtain extends OpenCloseDevice {
  static get type() {
    return 'action.devices.types.CURTAIN';
  }
}

module.exports = Curtain;

const OpenCloseDevice = require('./openclosedevice.js');

class Door extends OpenCloseDevice {
  static get type() {
    return 'action.devices.types.DOOR';
  }
}

module.exports = Door;

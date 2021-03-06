const OpenCloseDevice = require('./openclosedevice.js');

class Gate extends OpenCloseDevice {
  static get type() {
    return 'action.devices.types.GATE';
  }
}

module.exports = Gate;

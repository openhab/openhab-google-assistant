const Shutter = require('./shutter.js');

class Curtain extends Shutter {
  static get type() {
    return 'action.devices.types.CURTAIN';
  }
}

module.exports = Curtain;

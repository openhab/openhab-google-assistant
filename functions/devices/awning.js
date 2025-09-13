const Shutter = require('./shutter.js');

class Awning extends Shutter {
  static get type() {
    return 'action.devices.types.AWNING';
  }
}

module.exports = Awning;

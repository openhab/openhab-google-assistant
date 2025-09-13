const Shutter = require('./shutter.js');

class Blinds extends Shutter {
  static get type() {
    return 'action.devices.types.BLINDS';
  }
}

module.exports = Blinds;

const Shutter = require('./shutter.js');

class Pergola extends Shutter {
  static get type() {
    return 'action.devices.types.PERGOLA';
  }
}

module.exports = Pergola;

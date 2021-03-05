const Fan = require('./fan.js');

class AirPurifier extends Fan {
  static get type() {
    return 'action.devices.types.AIRPURIFIER';
  }
}

module.exports = AirPurifier;

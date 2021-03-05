const Fan = require('./fan.js');

class Hood extends Fan {
  static get type() {
    return 'action.devices.types.HOOD';
  }
}

module.exports = Hood;

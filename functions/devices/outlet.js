const Switch = require('./switch.js');

class Outlet extends Switch {
  static get type() {
    return 'action.devices.types.OUTLET';
  }
}

module.exports = Outlet;

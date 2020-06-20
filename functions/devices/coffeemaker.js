const Switch = require('./switch.js');

class CoffeeMaker extends Switch {
  static get type() {
    return 'action.devices.types.COFFEE_MAKER';
  }
}

module.exports = CoffeeMaker;

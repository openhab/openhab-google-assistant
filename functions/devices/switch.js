const DefaultDevice = require('./default.js');

class Switch extends DefaultDevice {
  static get type() {
    return 'action.devices.types.SWITCH';
  }

  static getTraits() {
    return [
      'action.devices.traits.OnOff'
    ];
  }

  static get requiredItemTypes() {
    return ['Switch'];
  }

  static getState(item) {
    let state = item.state === 'ON';
    if (this.getConfig(item).inverted === true) {
      state = !state;
    }
    return {
      on: state
    };
  }
}

module.exports = Switch;

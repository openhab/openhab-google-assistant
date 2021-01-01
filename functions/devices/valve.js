const DefaultDevice = require('./default.js');

class Valve extends DefaultDevice {
  static get type() {
    return 'action.devices.types.VALVE';
  }

  static getTraits() {
    return [
      'action.devices.traits.OpenClose'
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
      openPercent: state ? 100 : 0
    };
  }
}

module.exports = Valve;

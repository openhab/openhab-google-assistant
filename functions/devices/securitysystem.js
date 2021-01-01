const DefaultDevice = require('./default.js');

class SecuritySystem extends DefaultDevice {
  static get type() {
    return 'action.devices.types.SECURITYSYSTEM';
  }

  static getTraits() {
    return [
      'action.devices.traits.ArmDisarm'
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
      isArmed: state
    };
  }
}

module.exports = SecuritySystem;

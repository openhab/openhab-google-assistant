const DefaultDevice = require('./default.js');

class StartStopSwitch extends DefaultDevice {
  static getTraits() {
    return [
      'action.devices.traits.StartStop'
    ];
  }

  static get requiredItemTypes() {
    return ['Switch'];
  }

  static getAttributes() {
    return { pausable: false };
  }

  static getState(item) {
    let state = item.state === 'ON';
    if (this.getConfig(item).inverted === true) {
      state = !state;
    }
    return {
      isRunning: state,
      isPaused: !state
    };
  }
}

module.exports = StartStopSwitch;

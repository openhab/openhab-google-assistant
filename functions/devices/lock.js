const DefaultDevice = require('./default.js');

class Lock extends DefaultDevice {
  static get type() {
    return 'action.devices.types.LOCK';
  }

  static getTraits() {
    return [
      'action.devices.traits.LockUnlock'
    ];
  }

  static get requiredItemTypes() {
    return ['Switch', 'Contact'];
  }

  static getState(item) {
    let state = item.state === 'ON' || item.state === 'CLOSED';
    if (this.getConfig(item).inverted === true) {
      state = !state;
    }
    return {
      isLocked: state
    };
  }
}

module.exports = Lock;

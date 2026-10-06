const DefaultDevice = require('./default.js');

class PressureCooker extends DefaultDevice {
  static get type() {
    return 'action.devices.types.PRESSURECOOKER';
  }

  static getTraits(item) {
    const traits = [];
    const members = this.getMembers(item);

    if ('pressureCookerPower' in members) {
      traits.push('action.devices.traits.OnOff');
    }
    if ('pressureCookerRunning' in members) {
      traits.push('action.devices.traits.StartStop');
    }

    return traits;
  }

  static get requiredItemTypes() {
    return ['Group'];
  }

  static matchesDeviceType(item) {
    return super.matchesDeviceType(item) && Object.keys(this.getMembers(item)).length > 0;
  }

  static get supportedMembers() {
    return [
      { name: 'pressureCookerPower', types: ['Switch'] },
      { name: 'pressureCookerRunning', types: ['Switch'] }
    ];
  }

  static getAttributes(item) {
    const attributes = {};
    const members = this.getMembers(item);

    if ('pressureCookerRunning' in members) {
      attributes.pausable = false;
    }

    return attributes;
  }

  static getState(item) {
    const state = {};
    const config = this.getConfig(item);
    const members = this.getMembers(item);

    if ('pressureCookerPower' in members) {
      let on = members.pressureCookerPower.state === 'ON';
      if (config.inverted === true) {
        on = !on;
      }
      state.on = on;
    }

    if ('pressureCookerRunning' in members) {
      let isRunning = members.pressureCookerRunning.state === 'ON';
      if (config.inverted === true) {
        isRunning = !isRunning;
      }
      state.isRunning = isRunning;
      state.isPaused = false;
    }

    return state;
  }
}

module.exports = PressureCooker;

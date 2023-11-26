const DefaultDevice = require('./default.js');

class DimmableLight extends DefaultDevice {
  static get type() {
    return 'action.devices.types.LIGHT';
  }

  static getTraits() {
    return ['action.devices.traits.OnOff', 'action.devices.traits.Brightness'];
  }

  static get requiredItemTypes() {
    return ['Dimmer'];
  }

  static getState(item) {
    const brightness = Math.round(parseFloat(item.state)) || 0;
    return {
      on: brightness > 0,
      brightness: brightness
    };
  }
}

module.exports = DimmableLight;

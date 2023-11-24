const DefaultDevice = require('./default.js');

class HumiditySensor extends DefaultDevice {
  static get type() {
    return 'action.devices.types.SENSOR';
  }

  static getTraits() {
    return ['action.devices.traits.HumiditySetting'];
  }

  static getAttributes() {
    return {
      queryOnlyHumiditySetting: true
    };
  }

  static get requiredItemTypes() {
    return ['Number'];
  }

  static matchesDeviceType(item) {
    return item.metadata && item.metadata.ga && item.metadata.ga.value.toLowerCase() === 'humiditysensor';
  }

  static getState(item) {
    const state = Math.round(Number(item.state));
    return {
      humidityAmbientPercent: state,
      humiditySetpointPercent: state
    };
  }
}

module.exports = HumiditySensor;

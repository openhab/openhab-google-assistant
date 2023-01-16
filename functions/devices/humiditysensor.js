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

  static isCompatible(item = {}) {
    return item.metadata && item.metadata.ga && item.metadata.ga.value.toLowerCase() == 'humiditysensor';
  }

  static getState(item) {
    return {
      humidityAmbientPercent: Number(parseFloat(item.state).toFixed(1))
    };
  }
}

module.exports = HumiditySensor;
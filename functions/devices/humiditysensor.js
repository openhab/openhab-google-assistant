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
    const config = this.getConfig(item);
    const maxHumidity = (config.maxHumidity && parseInt(config.maxHumidity)) ?? 100;
    const state = Math.round(parseFloat(item.state) * (100 / maxHumidity));
    return {
      humidityAmbientPercent: state,
      humiditySetpointPercent: state
    };
  }
}

module.exports = HumiditySensor;

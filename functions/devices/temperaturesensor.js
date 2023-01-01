const DefaultDevice = require('./default.js');
const convertFahrenheitToCelsius = require('../utilities.js').convertFahrenheitToCelsius;

class TemperatureSensor extends DefaultDevice {
  static get type() {
    return 'action.devices.types.SENSOR';
  }

  static getTraits() {
    return ['action.devices.traits.TemperatureControl'];
  }

  static getAttributes(item) {
    const config = this.getConfig(item);
    const attributes = {
      queryOnlyTemperatureControl: true,
      temperatureUnitForUX: config.useFahrenheit === true ? 'F' : 'C',
      temperatureRange: {
        minThresholdCelsius: -100,
        maxThresholdCelsius: 100
      }
    };
    if ('temperatureRange' in config) {
      const [min, max] = config.temperatureRange.split(',').map((s) => parseFloat(s.trim()));
      if (!isNaN(min) && !isNaN(max)) {
        attributes.temperatureRange = {
          minThresholdCelsius: min,
          maxThresholdCelsius: max
        };
      }
    }
    return attributes;
  }

  static get requiredItemTypes() {
    return ['Number'];
  }

  static isCompatible(item = {}) {
    return item.metadata && item.metadata.ga && item.metadata.ga.value.toLowerCase() == 'temperaturesensor';
  }

  static getState(item) {
    let state = Number(parseFloat(item.state).toFixed(1));
    if (this.getConfig(item).useFahrenheit === true) {
      state = convertFahrenheitToCelsius(state);
    }
    return {
      temperatureSetpointCelsius: state,
      temperatureAmbientCelsius: state
    };
  }
}

module.exports = TemperatureSensor;

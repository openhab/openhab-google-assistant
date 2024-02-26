const DefaultDevice = require('./default.js');
const convertFahrenheitToCelsius = require('../utilities.js').convertFahrenheitToCelsius;

class TemperatureSensor extends DefaultDevice {
  static get type() {
    return 'action.devices.types.SENSOR';
  }

  static getTraits() {
    return ['action.devices.traits.TemperatureSetting', 'action.devices.traits.TemperatureControl'];
  }

  static getAttributes(item) {
    const attributes = {
      queryOnlyTemperatureSetting: true,
      thermostatTemperatureUnit: this.useFahrenheit(item) ? 'F' : 'C',
      queryOnlyTemperatureControl: true,
      temperatureUnitForUX: this.useFahrenheit(item) ? 'F' : 'C',
      temperatureRange: {
        minThresholdCelsius: -100,
        maxThresholdCelsius: 100
      }
    };
    const config = this.getConfig(item);
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

  static matchesDeviceType(item) {
    return item.metadata && item.metadata.ga && item.metadata.ga.value.toLowerCase() === 'temperaturesensor';
  }

  static getState(item) {
    let state = Number(parseFloat(item.state).toFixed(1));
    if (this.useFahrenheit(item)) {
      state = convertFahrenheitToCelsius(state);
    }
    return {
      thermostatTemperatureAmbient: state,
      temperatureAmbientCelsius: state,
      temperatureSetpointCelsius: state
    };
  }

  static useFahrenheit(item) {
    const config = this.getConfig(item);
    return config.thermostatTemperatureUnit === 'F' || config.useFahrenheit === true;
  }
}

module.exports = TemperatureSensor;

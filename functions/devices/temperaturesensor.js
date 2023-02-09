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
    return {
      queryOnlyTemperatureSetting: true,
      thermostatTemperatureUnit: this.useFahrenheit(item) ? 'F' : 'C',
      queryOnlyTemperatureControl: true,
      temperatureUnitForUX: this.useFahrenheit(item) ? 'F' : 'C'
    };
  }

  static get requiredItemTypes() {
    return ['Number'];
  }

  static isCompatible(item = {}) {
    return item.metadata && item.metadata.ga && item.metadata.ga.value.toLowerCase() == 'temperaturesensor';
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

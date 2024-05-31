const DefaultDevice = require('./default.js');
const convertFahrenheitToCelsius = require('../utilities.js').convertFahrenheitToCelsius;

class ClimateSensor extends DefaultDevice {
  static get type() {
    return 'action.devices.types.SENSOR';
  }

  static getTraits(item) {
    const traits = [];
    const members = this.getMembers(item);
    if ('temperatureAmbient' in members)
      traits.push('action.devices.traits.TemperatureSetting', 'action.devices.traits.TemperatureControl');
    if ('humidityAmbient' in members) traits.push('action.devices.traits.HumiditySetting');
    return traits;
  }

  static getAttributes(item) {
    const attributes = {};
    const members = this.getMembers(item);
    if ('temperatureAmbient' in members) {
      attributes.queryOnlyTemperatureControl = true;
      attributes.temperatureUnitForUX = this.useFahrenheit(item) ? 'F' : 'C';
      attributes.queryOnlyTemperatureSetting = true;
      attributes.thermostatTemperatureUnit = this.useFahrenheit(item) === true ? 'F' : 'C';
      attributes.temperatureRange = {
        minThresholdCelsius: -100,
        maxThresholdCelsius: 100
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
    }
    if ('humidityAmbient' in members) {
      attributes.queryOnlyHumiditySetting = true;
    }
    return attributes;
  }

  static get requiredItemTypes() {
    return ['Group'];
  }

  static matchesDeviceType(item) {
    return (
      item.metadata &&
      item.metadata.ga &&
      item.metadata.ga.value.toLowerCase() === 'climatesensor' &&
      Object.keys(this.getMembers(item)).length > 0
    );
  }

  static getState(item) {
    const state = {};
    const members = this.getMembers(item);
    if ('temperatureAmbient' in members) {
      let temperature = Number(parseFloat(members.temperatureAmbient.state).toFixed(1));
      if (this.useFahrenheit(item)) {
        temperature = convertFahrenheitToCelsius(temperature);
      }
      state.thermostatTemperatureAmbient = temperature;
      state.temperatureAmbientCelsius = temperature;
      state.temperatureSetpointCelsius = temperature;
    }
    if ('humidityAmbient' in members) {
      const config = this.getConfig(item);
      const maxHumidity = (config.maxHumidity && parseInt(config.maxHumidity)) || 100;
      const humidity = Math.round(parseFloat(members.humidityAmbient.state) * (100 / maxHumidity));
      state.humidityAmbientPercent = humidity;
      state.humiditySetpointPercent = humidity;
    }
    return state;
  }

  static get supportedMembers() {
    return [
      { name: 'temperatureAmbient', types: ['Number'] },
      { name: 'humidityAmbient', types: ['Number'] }
    ];
  }

  static useFahrenheit(item) {
    const config = this.getConfig(item);
    return config.thermostatTemperatureUnit === 'F' || config.useFahrenheit === true;
  }
}

module.exports = ClimateSensor;

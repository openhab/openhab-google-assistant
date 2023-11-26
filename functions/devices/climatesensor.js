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
    }
    if ('humidityAmbient' in members) {
      attributes.queryOnlyHumiditySetting = true;
    }
    return attributes;
  }

  static matchesItemType(item) {
    return item.type === 'Group' && Object.keys(this.getMembers(item)).length > 0;
  }

  static isCompatible(item = {}) {
    return (
      item.metadata &&
      item.metadata.ga &&
      item.metadata.ga.value.toLowerCase() == 'climatesensor' &&
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
      const humidity = Math.round(parseFloat(members.humidityAmbient.state));
      state.humidityAmbientPercent = humidity;
      state.humiditySetpointPercent = humidity;
    }
    return state;
  }

  /**
   * @returns {object}
   */
  static getMembers(item) {
    const supportedMembers = ['temperatureAmbient', 'humidityAmbient'];
    const members = {};
    if (item.members && item.members.length) {
      item.members.forEach((member) => {
        if (member.metadata && member.metadata.ga) {
          const memberType = supportedMembers.find((m) => member.metadata.ga.value.toLowerCase() === m.toLowerCase());
          if (memberType) {
            members[memberType] = { name: member.name, state: member.state };
          }
        }
      });
    }
    return members;
  }

  static useFahrenheit(item) {
    const config = this.getConfig(item);
    return config.thermostatTemperatureUnit === 'F' || config.useFahrenheit === true;
  }
}

module.exports = ClimateSensor;

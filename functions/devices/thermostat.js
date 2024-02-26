const DefaultDevice = require('./default.js');
const convertFahrenheitToCelsius = require('../utilities.js').convertFahrenheitToCelsius;

class Thermostat extends DefaultDevice {
  static get type() {
    return 'action.devices.types.THERMOSTAT';
  }

  static getTraits() {
    return ['action.devices.traits.TemperatureSetting'];
  }

  static get requiredItemTypes() {
    return ['Group'];
  }

  static matchesDeviceType(item) {
    return super.matchesDeviceType(item) && Object.keys(this.getMembers(item)).length > 0;
  }

  static getAttributes(item) {
    const config = this.getConfig(item);
    const attributes = {
      thermostatTemperatureUnit: this.useFahrenheit(item) ? 'F' : 'C'
    };
    if ('thermostatTemperatureRange' in config) {
      const [min, max] = config.thermostatTemperatureRange.split(',').map((s) => parseFloat(s.trim()));
      if (!isNaN(min) && !isNaN(max)) {
        attributes.thermostatTemperatureRange = {
          minThresholdCelsius: min,
          maxThresholdCelsius: max
        };
      }
    }
    const members = this.getMembers(item);
    if (
      'thermostatTemperatureAmbient' in members &&
      !('thermostatMode' in members) &&
      !('thermostatTemperatureSetpoint' in members)
    ) {
      attributes.queryOnlyTemperatureSetting = true;
    } else {
      attributes.availableThermostatModes = Object.keys(this.getModeMap(item));
    }
    return attributes;
  }

  static getState(item) {
    const state = {};
    const members = this.getMembers(item);
    for (const member in members) {
      if (member === 'thermostatMode') {
        state[member] = this.translateModeToGoogle(item, members[member].state);
      } else {
        state[member] = Number(parseFloat(members[member].state).toFixed(1));
        if (member.indexOf('Temperature') > 0 && this.useFahrenheit(item)) {
          state[member] = convertFahrenheitToCelsius(state[member]);
        }
      }
    }
    return state;
  }

  static get supportedMembers() {
    return [
      { name: 'thermostatMode', types: ['Number', 'String', 'Switch'] },
      { name: 'thermostatTemperatureSetpoint', types: ['Number'] },
      { name: 'thermostatTemperatureSetpointHigh', types: ['Number'] },
      { name: 'thermostatTemperatureSetpointLow', types: ['Number'] },
      { name: 'thermostatTemperatureAmbient', types: ['Number'] },
      { name: 'thermostatHumidityAmbient', types: ['Number'] }
    ];
  }

  static useFahrenheit(item) {
    const config = this.getConfig(item);
    return config.thermostatTemperatureUnit === 'F' || config.useFahrenheit === true;
  }

  static getModeMap(item) {
    const config = this.getConfig(item);
    let thermostatModes = ['off', 'heat', 'cool', 'on', 'heatcool', 'auto', 'eco'];
    if ('thermostatModes' in config) {
      thermostatModes = config.thermostatModes.split(',').map((s) => s.trim());
    }
    const modeMap = {};
    thermostatModes.forEach((pair) => {
      const [key, value] = pair.split('=').map((s) => s.trim());
      modeMap[key] = value ? value.split(':').map((s) => s.trim()) : [key];
    });
    return modeMap;
  }

  static translateModeToOpenhab(item, mode) {
    const modeMap = this.getModeMap(item);
    if (mode in modeMap) {
      return modeMap[mode][0];
    }
    throw { statusCode: 400 };
  }

  static translateModeToGoogle(item, mode) {
    const modeMap = this.getModeMap(item);
    for (const key in modeMap) {
      if (modeMap[key].includes(mode)) {
        return key;
      }
    }
    return 'on';
  }
}

module.exports = Thermostat;

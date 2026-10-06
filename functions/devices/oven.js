const DefaultDevice = require('./default.js');
const convertFahrenheitToCelsius = require('../utilities.js').convertFahrenheitToCelsius;

class Oven extends DefaultDevice {
  static get type() {
    return 'action.devices.types.OVEN';
  }

  static getTraits(item) {
    const traits = [];
    const members = this.getMembers(item);

    if ('ovenPower' in members) {
      traits.push('action.devices.traits.OnOff');
    }
    if ('ovenRunning' in members) {
      traits.push('action.devices.traits.StartStop');
    }
    if ('ovenTemperatureTarget' in members || 'ovenTemperatureAmbient' in members) {
      traits.push('action.devices.traits.TemperatureControl');
    }

    return traits;
  }

  static get requiredItemTypes() {
    return ['Group'];
  }

  static matchesDeviceType(item) {
    return super.matchesDeviceType(item) && Object.keys(this.getMembers(item)).length > 0;
  }

  static get supportedMembers() {
    return [
      { name: 'ovenPower', types: ['Switch'] },
      { name: 'ovenRunning', types: ['Switch'] },
      { name: 'ovenTemperatureTarget', types: ['Number'] },
      { name: 'ovenTemperatureAmbient', types: ['Number'] }
    ];
  }

  static getAttributes(item) {
    const attributes = {};
    const members = this.getMembers(item);

    if ('ovenRunning' in members) {
      attributes.pausable = false;
    }

    if ('ovenTemperatureTarget' in members || 'ovenTemperatureAmbient' in members) {
      const config = this.getConfig(item);
      attributes.temperatureUnitForUX = this.useFahrenheit(item) ? 'F' : 'C';
      attributes.temperatureRange = {
        minThresholdCelsius: 0,
        maxThresholdCelsius: 300
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
      if (!('ovenTemperatureTarget' in members)) {
        attributes.queryOnlyTemperatureControl = true;
      } else {
        const step = parseFloat(config.temperatureStep);
        attributes.temperatureStepCelsius = !isNaN(step) ? step : 1;
      }
    }

    return attributes;
  }

  static getState(item) {
    const state = {};
    const config = this.getConfig(item);
    const members = this.getMembers(item);

    if ('ovenPower' in members) {
      let on = members.ovenPower.state === 'ON';
      if (config.inverted === true) {
        on = !on;
      }
      state.on = on;
    }

    if ('ovenRunning' in members) {
      let isRunning = members.ovenRunning.state === 'ON';
      if (config.inverted === true) {
        isRunning = !isRunning;
      }
      state.isRunning = isRunning;
      state.isPaused = false;
    }

    if ('ovenTemperatureTarget' in members) {
      const target = parseFloat(members.ovenTemperatureTarget.state);
      if (!isNaN(target)) {
        state.temperatureSetpointCelsius = this.useFahrenheit(item) ? convertFahrenheitToCelsius(target) : target;
      }
    }

    if ('ovenTemperatureAmbient' in members) {
      const ambient = parseFloat(members.ovenTemperatureAmbient.state);
      if (!isNaN(ambient)) {
        state.temperatureAmbientCelsius = this.useFahrenheit(item) ? convertFahrenheitToCelsius(ambient) : ambient;
      }
    }

    return state;
  }

  static useFahrenheit(item) {
    const config = this.getConfig(item);
    return config.thermostatTemperatureUnit === 'F' || config.useFahrenheit === true;
  }
}

module.exports = Oven;

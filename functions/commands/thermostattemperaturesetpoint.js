const DefaultCommand = require('./default.js');
const Thermostat = require('../devices/thermostat.js');
const convertCelsiusToFahrenheit = require('../utilities.js').convertCelsiusToFahrenheit;
const { ERROR_CODES, GoogleAssistantError } = require('../googleErrorCodes.js');

class ThermostatTemperatureSetpoint extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.ThermostatTemperatureSetpoint';
  }

  static validateParams(params) {
    return 'thermostatTemperatureSetpoint' in params && typeof params.thermostatTemperatureSetpoint === 'number';
  }

  static requiresItem() {
    return true;
  }

  static getItemName(device) {
    const members = this.getMembers(device);
    if ('thermostatTemperatureSetpoint' in members) {
      return members.thermostatTemperatureSetpoint;
    }
    throw new GoogleAssistantError(
      ERROR_CODES.NOT_SUPPORTED,
      'Thermostat has no thermostatTemperatureSetpoint member configured'
    );
  }

  static convertParamsToValue(params, item) {
    let value = params.thermostatTemperatureSetpoint;
    if (Thermostat.useFahrenheit(item)) {
      value = convertCelsiusToFahrenheit(value);
    }
    return value.toString();
  }

  static getResponseStates(params, item) {
    const states = Thermostat.getState(item);
    states.thermostatTemperatureSetpoint = params.thermostatTemperatureSetpoint;
    return states;
  }

  static checkCurrentState(target, state, params) {
    const targetTemp = parseFloat(target);
    const currentTemp = parseFloat(state);
    if (!isNaN(targetTemp) && !isNaN(currentTemp)) {
      if (Math.abs(targetTemp - currentTemp) < 0.5) {
        throw new GoogleAssistantError(
          ERROR_CODES.TARGET_ALREADY_REACHED,
          `Already at target temperature ${params.thermostatTemperatureSetpoint}°C`
        );
      }
    }
  }
}

module.exports = ThermostatTemperatureSetpoint;

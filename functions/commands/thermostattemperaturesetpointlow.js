const DefaultCommand = require('./default.js');
const Thermostat = require('../devices/thermostat.js');
const convertCelsiusToFahrenheit = require('../utilities.js').convertCelsiusToFahrenheit;
const { ERROR_CODES, GoogleAssistantError } = require('../googleErrorCodes.js');

class ThermostatTemperatureSetpointLow extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.ThermostatTemperatureSetpointLow';
  }

  static validateParams(params) {
    return 'thermostatTemperatureSetpointLow' in params && typeof params.thermostatTemperatureSetpointLow === 'number';
  }

  static requiresItem() {
    return true;
  }

  static getItemName(device) {
    const members = this.getMembers(device);
    if ('thermostatTemperatureSetpointLow' in members) {
      return members.thermostatTemperatureSetpointLow;
    }
    throw new GoogleAssistantError(
      ERROR_CODES.NOT_SUPPORTED,
      'Thermostat has no thermostatTemperatureSetpointLow member configured'
    );
  }

  static convertParamsToValue(params, item) {
    let value = params.thermostatTemperatureSetpointLow;
    if (Thermostat.useFahrenheit(item)) {
      value = convertCelsiusToFahrenheit(value);
    }
    return value.toString();
  }

  static getResponseStates(params, item) {
    const states = Thermostat.getState(item);
    const newLow = params.thermostatTemperatureSetpointLow;
    const currentHigh = states.thermostatTemperatureSetpointHigh;
    if (typeof currentHigh === 'number' && !isNaN(currentHigh)) {
      if (newLow >= currentHigh) {
        throw new GoogleAssistantError(
          ERROR_CODES.LOCKED_TO_RANGE,
          'Low setpoint must be below the current high setpoint'
        );
      }
      if (currentHigh - newLow < 0.5) {
        throw new GoogleAssistantError(ERROR_CODES.RANGE_TOO_CLOSE, 'Setpoint range is too close to adjust');
      }
    }
    const attrs = Thermostat.getAttributes(item);
    const range = attrs.thermostatTemperatureRange;
    if (range) {
      const min = range.minThresholdCelsius;
      const max = range.maxThresholdCelsius;
      if (typeof min === 'number' && newLow < min) {
        throw new GoogleAssistantError(ERROR_CODES.VALUE_OUT_OF_RANGE, 'Temperature below minimum allowed');
      }
      if (typeof max === 'number' && newLow > max) {
        throw new GoogleAssistantError(ERROR_CODES.VALUE_OUT_OF_RANGE, 'Temperature above maximum allowed');
      }
    }
    states.thermostatTemperatureSetpointLow = params.thermostatTemperatureSetpointLow;
    return states;
  }
}

module.exports = ThermostatTemperatureSetpointLow;

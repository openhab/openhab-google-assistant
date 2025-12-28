const DefaultCommand = require('./default.js');
const Thermostat = require('../devices/thermostat.js');
const convertCelsiusToFahrenheit = require('../utilities.js').convertCelsiusToFahrenheit;
const { ERROR_CODES, GoogleAssistantError } = require('../googleErrorCodes.js');

class ThermostatTemperatureSetpointHigh extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.ThermostatTemperatureSetpointHigh';
  }

  static validateParams(params) {
    return (
      'thermostatTemperatureSetpointHigh' in params && typeof params.thermostatTemperatureSetpointHigh === 'number'
    );
  }

  static requiresItem() {
    return true;
  }

  static getItemName(device) {
    const members = this.getMembers(device);
    if ('thermostatTemperatureSetpointHigh' in members) {
      return members.thermostatTemperatureSetpointHigh;
    }
    throw new GoogleAssistantError(
      ERROR_CODES.NOT_SUPPORTED,
      'Thermostat has no thermostatTemperatureSetpointHigh member configured'
    );
  }

  static convertParamsToValue(params, item) {
    let value = params.thermostatTemperatureSetpointHigh;
    if (Thermostat.useFahrenheit(item)) {
      value = convertCelsiusToFahrenheit(value);
    }
    return value.toString();
  }

  static getResponseStates(params, item) {
    const states = Thermostat.getState(item);
    const newHigh = params.thermostatTemperatureSetpointHigh;
    const currentLow = states.thermostatTemperatureSetpointLow;
    if (typeof currentLow === 'number' && !isNaN(currentLow)) {
      if (newHigh <= currentLow) {
        throw new GoogleAssistantError(
          ERROR_CODES.LOCKED_TO_RANGE,
          'High setpoint must be above the current low setpoint'
        );
      }
      if (newHigh - currentLow < 0.5) {
        throw new GoogleAssistantError(ERROR_CODES.RANGE_TOO_CLOSE, 'Setpoint range is too close to adjust');
      }
    }
    const attrs = Thermostat.getAttributes(item);
    const range = attrs.thermostatTemperatureRange;
    if (range) {
      const min = range.minThresholdCelsius;
      const max = range.maxThresholdCelsius;
      if (typeof min === 'number' && newHigh < min) {
        throw new GoogleAssistantError(ERROR_CODES.VALUE_OUT_OF_RANGE, 'Temperature below minimum allowed');
      }
      if (typeof max === 'number' && newHigh > max) {
        throw new GoogleAssistantError(ERROR_CODES.VALUE_OUT_OF_RANGE, 'Temperature above maximum allowed');
      }
    }
    states.thermostatTemperatureSetpointHigh = params.thermostatTemperatureSetpointHigh;
    return states;
  }
}

module.exports = ThermostatTemperatureSetpointHigh;

const DefaultCommand = require('./default.js');
const Thermostat = require('../devices/thermostat.js');
const convertCelsiusToFahrenheit = require('../utilities.js').convertCelsiusToFahrenheit;

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
    throw { statusCode: 400 };
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
    states.thermostatTemperatureSetpointHigh = params.thermostatTemperatureSetpointHigh;
    return states;
  }
}

module.exports = ThermostatTemperatureSetpointHigh;

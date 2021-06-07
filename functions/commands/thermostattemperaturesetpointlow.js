const DefaultCommand = require('./default.js');
const Thermostat = require('../devices/thermostat.js');
const convertToFahrenheit = require('../utilities.js').convertToFahrenheit;

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
    throw { statusCode: 400 };
  }

  static convertParamsToValue(params, item) {
    let value = params.thermostatTemperatureSetpointLow;
    if (Thermostat.useFahrenheit(item)) {
      value = convertToFahrenheit(value);
    }
    return value.toString();
  }

  static getResponseStates(params, item) {
    const states = Thermostat.getState(item);
    states.thermostatTemperatureSetpointLow = params.thermostatTemperatureSetpointLow;
    return states;
  }
}

module.exports = ThermostatTemperatureSetpointLow;

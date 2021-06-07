const DefaultCommand = require('./default.js');
const Thermostat = require('../devices/thermostat.js');
const convertToFahrenheit = require('../utilities.js').convertToFahrenheit;

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
    throw { statusCode: 400 };
  }

  static convertParamsToValue(params, item) {
    let value = params.thermostatTemperatureSetpoint;
    if (Thermostat.useFahrenheit(item)) {
      value = convertToFahrenheit(value);
    }
    return value.toString();
  }

  static getResponseStates(params, item) {
    const states = Thermostat.getState(item);
    states.thermostatTemperatureSetpoint = params.thermostatTemperatureSetpoint;
    return states;
  }
}

module.exports = ThermostatTemperatureSetpoint;

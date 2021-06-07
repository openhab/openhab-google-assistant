const DefaultCommand = require('./default.js');
const Thermostat = require('../devices/thermostat.js');
const convertToFahrenheit = require('../utilities.js').convertToFahrenheit;

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
    const members = (device.customData && device.customData.members) || {};
    if ('thermostatTemperatureSetpointHigh' in members) {
      return members.thermostatTemperatureSetpointHigh;
    }
    throw { statusCode: 400 };
  }

  static convertParamsToValue(params, item) {
    let value = params.thermostatTemperatureSetpointHigh;
    if (Thermostat.useFahrenheit(item)) {
      value = convertToFahrenheit(value);
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

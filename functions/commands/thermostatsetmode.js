const DefaultCommand = require('./default.js');
const Thermostat = require('../devices/thermostat.js');

class ThermostatSetMode extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.ThermostatSetMode';
  }

  static validateParams(params) {
    return ('thermostatMode' in params) && typeof params.thermostatMode === 'string';
  }

  static requiresItem() {
    return true;
  }

  static getItemName(item) {
    const members = Thermostat.getMembers(item);
    if ('thermostatMode' in members) {
      return members.thermostatMode.name;
    }
    throw { statusCode: 400 };
  }

  static convertParamsToValue(params, item) {
    return Thermostat.translateModeToOpenhab(item, params.thermostatMode);
  }

  static getResponseStates(params, item) {
    const states = Thermostat.getState(item);
    states.thermostatMode = params.thermostatMode;
    return states;
  }
}

module.exports = ThermostatSetMode;

const DefaultCommand = require('./default.js');
const Thermostat = require('../devices/thermostat.js');
const { ERROR_CODES, GoogleAssistantError } = require('../googleErrorCodes.js');

class ThermostatSetMode extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.ThermostatSetMode';
  }

  static validateParams(params) {
    return 'thermostatMode' in params && typeof params.thermostatMode === 'string';
  }

  static requiresItem() {
    return true;
  }

  static getItemName(device) {
    const members = this.getMembers(device);
    if ('thermostatMode' in members) {
      return members.thermostatMode;
    }
    throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'Thermostat has no thermostatMode member configured');
  }

  static convertParamsToValue(params, item) {
    return Thermostat.translateModeToOpenhab(item, params.thermostatMode);
  }

  static getResponseStates(params, item) {
    const states = Thermostat.getState(item);
    states.thermostatMode = params.thermostatMode;
    return states;
  }

  static checkCurrentState(target, state, params) {
    if (target === state) {
      const modeErrorMap = {
        auto: ERROR_CODES.IN_AUTO_MODE,
        off: ERROR_CODES.IN_OFF_MODE,
        eco: ERROR_CODES.IN_ECO_MODE,
        dry: ERROR_CODES.IN_DRY_MODE,
        'fan-only': ERROR_CODES.IN_FAN_ONLY_MODE,
        purifier: ERROR_CODES.IN_PURIFIER_MODE,
        heat: ERROR_CODES.IN_HEAT_OR_COOL,
        cool: ERROR_CODES.IN_HEAT_OR_COOL,
        heatcool: ERROR_CODES.IN_HEAT_OR_COOL
      };
      const errorCode = modeErrorMap[params.thermostatMode] || ERROR_CODES.ALREADY_IN_STATE;
      throw new GoogleAssistantError(errorCode, `Thermostat is already in ${params.thermostatMode} mode`);
    }
  }
}

module.exports = ThermostatSetMode;

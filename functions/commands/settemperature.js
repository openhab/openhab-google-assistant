const DefaultCommand = require('./default.js');
const Oven = require('../devices/oven.js');
const convertCelsiusToFahrenheit = require('../utilities.js').convertCelsiusToFahrenheit;
const { ERROR_CODES, GoogleAssistantError } = require('../googleErrorCodes.js');

class SetTemperature extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.SetTemperature';
  }

  static validateParams(params) {
    return 'temperature' in params && typeof params.temperature === 'number';
  }

  static requiresItem() {
    return true;
  }

  static getItemName(device) {
    const members = this.getMembers(device);
    if ('ovenTemperatureTarget' in members) {
      return members.ovenTemperatureTarget;
    }
    throw new GoogleAssistantError(ERROR_CODES.NOT_SUPPORTED, 'Oven has no ovenTemperatureTarget member configured');
  }

  static convertParamsToValue(params, item) {
    let value = params.temperature;
    if (Oven.useFahrenheit(item)) {
      value = convertCelsiusToFahrenheit(value);
    }
    return value.toString();
  }

  static getResponseStates(params, item) {
    const states = Oven.getState(item);
    states.temperatureSetpointCelsius = params.temperature;
    return states;
  }

  static checkCurrentState(target, state, params, item) {
    const targetTemp = parseFloat(target);
    const currentTemp = parseFloat(state);
    const tolerance = Oven.useFahrenheit(item) ? 0.9 : 0.5;
    if (!isNaN(targetTemp) && !isNaN(currentTemp)) {
      if (Math.abs(targetTemp - currentTemp) < tolerance) {
        throw new GoogleAssistantError(
          ERROR_CODES.TARGET_ALREADY_REACHED,
          `Already at target temperature ${params.temperature}°C`
        );
      }
    }
  }
}

module.exports = SetTemperature;

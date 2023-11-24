const DefaultCommand = require('./default.js');
const Charger = require('../devices/charger.js');

class Charge extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.Charge';
  }

  static validateParams(params) {
    return 'charge' in params && typeof params.charge === 'boolean';
  }

  static getItemName(device) {
    const members = this.getMembers(device);
    if ('chargerCharging' in members) {
      return members.chargerCharging;
    }
    throw { statusCode: 400 };
  }

  static convertParamsToValue(params, _, device) {
    let charge = params.charge;
    if (this.isInverted(device)) {
      charge = !charge;
    }
    return charge ? 'ON' : 'OFF';
  }

  static getResponseStates(params, item) {
    const states = Charger.getState(item);
    states.isCharging = params.charge;
    return states;
  }
}

module.exports = Charge;

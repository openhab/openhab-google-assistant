const DefaultDevice = require('./default.js');
const Fan = require('./fan');
const Thermostat = require('./thermostat');

class ACUnit extends DefaultDevice {
  static get type() {
    return 'action.devices.types.AC_UNIT';
  }

  static getTraits() {
    return [...Fan.getTraits(), ...Thermostat.getTraits()];
  }

  static matchesItemType(item) {
    return item.type === 'Group' && Object.keys(this.getMembers(item)).length > 0;
  }

  static getAttributes(item) {
    const attributes = {
      ...Fan.getAttributes(item),
      ...Thermostat.getAttributes(item)
    };

    return attributes;
  }

  static getState(item) {
    const state = {
      ...Thermostat.getState(item)
    };

    const members = this.getMembers(item);
    for (const member in members) {
      if (member == 'fanPower') {
        state.on = members[member].state === 'ON';
      }
      if (member == 'fanSpeed') {
        if ('speeds' in this.getConfig(item)) {
          state.currentFanSpeedSetting = members[member].state.toString();
        }
        state.currentFanSpeedPercent = Number(members[member].state);
      }
    }

    return state;
  }

  static getMembers(item) {
    const supportedMembers = [
      'thermostatMode',
      'thermostatTemperatureSetpoint',
      'thermostatTemperatureSetpointHigh',
      'thermostatTemperatureSetpointLow',
      'thermostatTemperatureAmbient',
      'thermostatHumidityAmbient',
      'fanSpeed',
      'fanPower'
    ];
    const members = {};
    if (item.members && item.members.length) {
      item.members.forEach((member) => {
        if (member.metadata && member.metadata.ga) {
          const memberType = supportedMembers.find((m) => member.metadata.ga.value.toLowerCase() === m.toLowerCase());
          if (memberType) {
            members[memberType] = { name: member.name, state: member.state };
          }
        }
      });
    }
    return members;
  }
}

module.exports = ACUnit;

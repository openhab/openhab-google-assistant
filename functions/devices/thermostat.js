const DefaultDevice = require('./default.js');

const hasTag = (item = {}, tag = '') => {
  return item.tags && item.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase()) || false;
};

class Thermostat extends DefaultDevice {
  static get type() {
    return 'action.devices.types.THERMOSTAT';
  }

  static get traits() {
    return [
      'action.devices.traits.TemperatureSetting'
    ];
  }

  static getAttributes(item) {
    const config = this.getConfig(item);
    const attributes = {
      thermostatTemperatureUnit: this.usesFahrenheit(item) ? 'F' : 'C'
    };
    if ('thermostatTemperatureRange' in config) {
      const [min, max] = config.thermostatTemperatureRange.split(',').map(s => parseFloat(s.trim()));
      if (!isNaN(min) && !isNaN(max)) {
        attributes.thermostatTemperatureRange = {
          minThresholdCelsius: min,
          maxThresholdCelsius: max
        }
      }
    }
    const members = this.getMembers(item);
    if (('thermostatTemperatureAmbient' in members) &&
      !('thermostatMode' in members) &&
      !('thermostatTemperatureSetpoint' in members)) {
      attributes.queryOnlyTemperatureSetting = true;
    } else {
      attributes.availableThermostatModes = Object.keys(this.getModeMap(item)).join(',');
    }
    return attributes;
  }

  static checkItemType(item) {
    return item.type === 'Group';
  }

  static getState(item) {
    const state = {};
    const members = this.getMembers(item);
    for (const member in members) {
      if (member == 'thermostatMode') {
        state[member] = this.translateModeToGoogle(item, members[member].state);
      } else {
        state[member] = Number(parseFloat(members[member].state).toFixed(1));
        if (member.indexOf('Temperature') > 0 && this.usesFahrenheit(item)) {
          state[member] = this.convertToCelsius(state[member]);
        }
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
      'thermostatHumidityAmbient'
    ];
    const members = Object();
    if (item.members && item.members.length) {
      item.members.forEach((member) => {
        if (member.metadata && member.metadata.ga) {
          const memberType = supportedMembers.find(m => member.metadata.ga.value.toLowerCase() === m.toLowerCase());
          if (memberType) {
            members[memberType] = { name: member.name, state: member.state };
          }
        } else {
          if (hasTag(member, 'HeatingCoolingMode') || hasTag(member, 'homekit:HeatingCoolingMode') || hasTag(member, 'homekit:TargetHeatingCoolingMode') || hasTag(member, 'homekit:CurrentHeatingCoolingMode')) {
            members.thermostatMode = { name: member.name, state: member.state };
          }
          if (hasTag(member, 'TargetTemperature') || hasTag(member, 'homekit:TargetTemperature')) {
            members.thermostatTemperatureSetpoint = { name: member.name, state: member.state };
          }
          if (hasTag(member, 'CurrentTemperature')) {
            members.thermostatTemperatureAmbient = { name: member.name, state: member.state };
          }
          if (hasTag(member, 'CurrentHumidity')) {
            members.thermostatHumidityAmbient = { name: member.name, state: member.state };
          }
        }
      });
    }
    return members;
  }

  static usesFahrenheit(item) {
    return this.getConfig(item).useFahrenheit === true || hasTag(item, 'Fahrenheit');
  }

  static getModeMap(item) {
    const config = this.getConfig(item);
    let modes = ['off', 'heat', 'cool', 'on', 'heatcool', 'auto', 'eco'];
    if ('modes' in config) {
      modes = config.modes.split(',').map(s => s.trim());
    }
    const modeMap = {};
    modes.forEach(pair => {
      const [key, value] = pair.split('=').map(s => s.trim());
      modeMap[key] = value ? value.split(':').map(s => s.trim()) : [key];
    });
    return modeMap;
  }

  static translateModeToOpenhab(item, mode) {
    const modeMap = this.getModeMap(item);
    if (mode in modeMap) {
      return modeMap[mode][0];
    }
    throw { statusCode: 400 };
  }

  static translateModeToGoogle(item, mode) {
    const modeMap = this.getModeMap(item);
    for (const key in modeMap) {
      if (modeMap[key].includes(mode)) {
        return key;
      }
    }
    return 'on';
  }

  static convertToFahrenheit(value = 0) {
    return Math.round(value * 9 / 5 + 32);
  }

  static convertToCelsius(value = 0) {
    return Number(((value - 32) * 5 / 9).toFixed(1));
  }
}

module.exports = Thermostat;

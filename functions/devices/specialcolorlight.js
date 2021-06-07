const DefaultDevice = require('./default.js');

class SpecialColorLight extends DefaultDevice {
  static get type() {
    return 'action.devices.types.LIGHT';
  }

  static getTraits() {
    return ['action.devices.traits.OnOff', 'action.devices.traits.Brightness', 'action.devices.traits.ColorSetting'];
  }

  static matchesItemType(item) {
    return (
      item.type === 'Group' &&
      Object.keys(this.getMembers(item)).length > 1 &&
      (this.useKelvin(item) || !!this.getAttributes(item).colorTemperatureRange)
    );
  }

  static getAttributes(item) {
    const attributes = {};
    const config = this.getConfig(item);
    if ('colorTemperatureRange' in config) {
      const [min, max] = config.colorTemperatureRange.split(',').map((s) => Number(s.trim()));
      if (!isNaN(min) && !isNaN(max)) {
        attributes.colorTemperatureRange = {
          temperatureMinK: min,
          temperatureMaxK: max
        };
      }
    }
    return attributes;
  }

  static getState(item) {
    const state = {};
    const members = this.getMembers(item);
    for (const member in members) {
      switch (member) {
        case 'lightPower':
          state.on = members[member].state === 'ON';
          break;
        case 'lightBrightness':
          state.brightness = Number(members[member].state) || 0;
          if (!('lightPower' in members)) {
            state.on = state.brightness > 0;
          }
          break;
        case 'lightColorTemperature':
          try {
            const { temperatureMinK, temperatureMaxK } = this.getAttributes(item).colorTemperatureRange;
            state.color = {};
            state.color.temperatureK = this.useKelvin(item)
              ? Number(members[member].state)
              : temperatureMinK +
                (((temperatureMaxK - temperatureMinK) / 100) * (100 - Number(members[member].state)) || 0);
          } catch (error) {
            //
          }
          break;
      }
    }
    return state;
  }

  static getMembers(item) {
    const supportedMembers = ['lightBrightness', 'lightColorTemperature', 'lightPower'];
    const members = Object();
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

  static useKelvin(item) {
    const config = this.getConfig(item);
    return config.useKelvin === true;
  }
}

module.exports = SpecialColorLight;

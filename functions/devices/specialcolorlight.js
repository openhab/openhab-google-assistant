const DefaultDevice = require('./default.js');

class SpecialColorLight extends DefaultDevice {
  static get type() {
    return 'action.devices.types.LIGHT';
  }

  static getTraits() {
    return ['action.devices.traits.OnOff', 'action.devices.traits.Brightness', 'action.devices.traits.ColorSetting'];
  }

  static isCompatible(item = {}) {
    return item.metadata && item.metadata.ga && item.metadata.ga.value.toLowerCase() == 'specialcolorlight';
  }

  static matchesItemType(item) {
    const members = this.getMembers(item);
    return (
      item.type === 'Group' &&
      Object.keys(members).length > 1 &&
      (!('lightColorTemperature' in members) ||
        this.useKelvin(item) ||
        !!this.getAttributes(item).colorTemperatureRange)
    );
  }

  static getAttributes(item) {
    const attributes = {};
    const members = this.getMembers(item);
    if ('lightColor' in members) {
      attributes.colorModel = 'hsv';
    }
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
        case 'lightColor':
          try {
            const [hue, sat, val] = members[member].state.split(',').map((s) => Number(s.trim()));
            if (val > 0) {
              state.color = {
                spectrumHSV: {
                  hue: hue,
                  saturation: sat / 100,
                  value: val / 100
                }
              };
            }
          } catch (error) {
            //
          }
          break;
        case 'lightColorTemperature':
          if (state.color) {
            break;
          }
          try {
            if (this.useKelvin(item)) {
              state.color = {
                temperatureK: Number(members[member].state)
              };
            } else {
              const { temperatureMinK, temperatureMaxK } = this.getAttributes(item).colorTemperatureRange;
              state.color = {
                temperatureK:
                  temperatureMinK +
                  (((temperatureMaxK - temperatureMinK) / 100) * (100 - Number(members[member].state)) || 0)
              };
            }
          } catch (error) {
            //
          }
          break;
      }
    }
    return state;
  }

  static getMembers(item) {
    const supportedMembers = ['lightBrightness', 'lightColor', 'lightColorTemperature', 'lightPower'];
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

  static useKelvin(item) {
    return this.getConfig(item).useKelvin === true;
  }
}

module.exports = SpecialColorLight;

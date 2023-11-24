const DefaultDevice = require('./default.js');
const convertMired = require('../utilities.js').convertMired;

class SpecialColorLight extends DefaultDevice {
  static get type() {
    return 'action.devices.types.LIGHT';
  }

  static getTraits() {
    return ['action.devices.traits.OnOff', 'action.devices.traits.Brightness', 'action.devices.traits.ColorSetting'];
  }

  static get requiredItemTypes() {
    return ['Group'];
  }

  static matchesDeviceType(item) {
    const members = this.getMembers(item);
    return !!(
      item.metadata &&
      item.metadata.ga &&
      item.metadata.ga.value.toLowerCase() == 'specialcolorlight' &&
      Object.keys(members).length > 1 &&
      (!('lightColorTemperature' in members) ||
        this.getColorUnit(item) !== 'percent' ||
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
        const colorUnit = this.getColorUnit(item);
        attributes.colorTemperatureRange = {
          temperatureMinK: colorUnit === 'mired' ? convertMired(max) : min,
          temperatureMaxK: colorUnit === 'mired' ? convertMired(min) : max
        };
      }
    }
    return attributes;
  }

  static getMetadata(item) {
    const metadata = super.getMetadata(item);
    const colorTemperatureRange = this.getAttributes(item).colorTemperatureRange;
    if (colorTemperatureRange) {
      metadata.customData.colorTemperatureRange = colorTemperatureRange;
    }
    const colorUnit = this.getColorUnit(item);
    if (colorUnit !== 'percent') {
      metadata.customData.colorUnit = colorUnit;
    }
    if (this.getColorTemperatureInverted(item)) {
      metadata.customData.colorTemperatureInverted = true;
    }
    return metadata;
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
          state.brightness = Math.round(Number(members[member].state)) || 0;
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
            const colorUnit = this.getColorUnit(item);
            if (colorUnit === 'kelvin') {
              state.color = {
                temperatureK: Math.round(Number(members[member].state))
              };
            } else if (colorUnit === 'mired') {
              state.color = {
                temperatureK: convertMired(Math.round(Number(members[member].state)))
              };
            } else {
              const { temperatureMinK, temperatureMaxK } = this.getAttributes(item).colorTemperatureRange;
              let percent = Number(members[member].state);
              if (this.getColorTemperatureInverted(item)) {
                percent = 100 - percent;
              }
              state.color = {
                temperatureK: temperatureMinK + Math.round(((temperatureMaxK - temperatureMinK) / 100) * percent || 0)
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

  static get supportedMembers() {
    return [
      { name: 'lightPower', types: ['Switch'] },
      { name: 'lightColor', types: ['Color'] },
      { name: 'lightBrightness', types: ['Dimmer', 'Number'] },
      { name: 'lightColorTemperature', types: ['Dimmer', 'Number'] }
    ];
  }

  static getColorUnit(item) {
    const colorUnit = this.getConfig(item).colorUnit || 'percent';
    return colorUnit.toLowerCase();
  }

  static getColorTemperatureInverted(item) {
    return !!this.getConfig(item).colorTemperatureInverted === true;
  }
}

module.exports = SpecialColorLight;

const ColorLight = require('./colorlight.js');

class SpecialColorLight extends ColorLight {
  static matchesItemType(item) {
    return item.type === 'Group' && Object.keys(this.getMembers(item)).length > 1 && this.getAttributes(item).colorTemperatureRange;
  }

  static getAttributes(item) {
    const attributes = super.getAttributes(item);
    delete attributes.colorModel;
    return attributes;
  }

  static getState(item) {
    const state = {};
    const members = this.getMembers(item);
    for (const member in members) {
      switch (member) {
        case 'lightBrightness':
          state.brightness = Number(members[member].state) || 0;
          state.on = state.brightness > 0;
          break;
        case 'lightColorTemperature':
          try {
            const { temperatureMinK, temperatureMaxK } = this.getAttributes(item).colorTemperatureRange;
            state.color = {};
            state.color.temperatureK = temperatureMinK + ((temperatureMaxK - temperatureMinK) / 100 * (100 - Number(members[member].state)) || 0);
          } catch { }
          break;
      }
    }
    return state;
  }

  static getMembers(item) {
    const supportedMembers = [
      'lightBrightness',
      'lightColorTemperature'
    ];
    const members = Object();
    if (item.members && item.members.length) {
      item.members.forEach(member => {
        if (member.metadata && member.metadata.ga) {
          const memberType = supportedMembers.find(m => member.metadata.ga.value.toLowerCase() === m.toLowerCase());
          if (memberType) {
            members[memberType] = { name: member.name, state: member.state };
          }
        }
      });
    }
    return members;
  }
}

module.exports = SpecialColorLight;

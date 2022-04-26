const DefaultDevice = require('./default.js');
const fan = require('./fan')
const thermostat = require('./thermostat')

class Thermostat extends DefaultDevice {
  static get type() {
    return 'action.devices.types.AC_UNIT';
  }

  static getTraits() {
    return ['action.devices.traits.TemperatureSetting',
            'action.devices.traits.FanSpeed',
            'action.devices.traits.OnOff'];
  }
  

  static matchesItemType(item) {
    return item.type === 'Group' && Object.keys(this.getMembers(item)).length > 0;
  }

  static getAttributes(item) {
    const attributes = {
      ...fan.getAttributes(item),
      ...thermostat.getAttributes(item)
    };

    return attributes;
  }

  static getState(item) {
    const state = {
        ...fan.getState(item),
        ...thermostat.getState(item),
        ...this.getAcPowerState(item)
    };
    return state;
  }

  static getAcPowerState(item) {
    if (item.members && item.members.length) {
      item.members.forEach((member) => {
        if (member.metadata && member.metadata.ga) {
          if(member.metadata.ga.value.toLowerCase() === 'acpower') {
              return {on: member.state}
          }
        }
      });
    }
    return {};
  }
 
}

module.exports = Thermostat;

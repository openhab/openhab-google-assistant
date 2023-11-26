const DefaultDevice = require('./default.js');

class Charger extends DefaultDevice {
  static get type() {
    return 'action.devices.types.CHARGER';
  }

  static getTraits() {
    return ['action.devices.traits.EnergyStorage'];
  }

  static matchesItemType(item) {
    return item.type === 'Group' && Object.keys(this.getMembers(item)).length > 0;
  }

  static getAttributes(item) {
    const config = this.getConfig(item);
    const members = this.getMembers(item);
    const attributes = {
      isRechargeable: !!config.isRechargeable,
      queryOnlyEnergyStorage: !('chargerCharging' in members)
    };
    return attributes;
  }

  static getState(item) {
    const state = {};
    const config = this.getConfig(item);
    const members = this.getMembers(item);
    for (const member in members) {
      switch (member) {
        case 'chargerCharging':
          state.isCharging = members[member].state === 'ON';
          break;
        case 'chargerPluggedIn':
          state.isPluggedIn = members[member].state === 'ON';
          break;
        case 'chargerCapacityRemaining': {
          const capacity = Math.round(parseFloat(members[member].state));
          if (!config.unit || config.unit === 'PERCENTAGE') {
            let descCapacity = 'UNKNOWN';
            if (capacity <= 10) {
              descCapacity = 'CRITICALLY_LOW';
            } else if (capacity <= 40) {
              descCapacity = 'LOW';
            } else if (capacity <= 75) {
              descCapacity = 'MEDIUM';
            } else if (capacity < 100) {
              descCapacity = 'HIGH';
            } else {
              descCapacity = 'FULL';
            }
            state.descriptiveCapacityRemaining = descCapacity;
          }
          state.capacityRemaining = [
            {
              unit: config.unit || 'PERCENTAGE',
              rawValue: capacity
            }
          ];
          break;
        }
        case 'chargerCapacityUntilFull': {
          state.capacityUntilFull = [
            {
              unit: config.unit || 'PERCENTAGE',
              rawValue: Math.round(parseFloat(members[member].state))
            }
          ];
          break;
        }
      }
    }
    return state;
  }

  static getMembers(item) {
    const supportedMembers = [
      'chargerCharging',
      'chargerPluggedIn',
      'chargerCapacityRemaining',
      'chargerCapacityUntilFull'
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

module.exports = Charger;

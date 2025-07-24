const DefaultDevice = require('./default.js');

class Vacuum extends DefaultDevice {
  static get type() {
    return 'action.devices.types.VACUUM';
  }

  static getTraits(item) {
    const members = this.getMembers(item);
    const traits = ['action.devices.traits.StartStop'];
    if ('vacuumDock' in members) traits.push('action.devices.traits.Dock');
    if ('vacuumLocate' in members) traits.push('action.devices.traits.Locator');
    if ('vacuumCurrentCycle' in members) traits.push('action.devices.traits.RunCycle');
    if ('vacuumBattery' in members) traits.push('action.devices.traits.EnergyStorage');
    return traits;
  }

  static get requiredItemTypes() {
    return ['Group'];
  }

  static matchesDeviceType(item) {
    return super.matchesDeviceType(item) && Object.keys(this.getMembers(item)).length > 0;
  }

  static get supportedMembers() {
    return [
      { name: 'vacuumPower', types: ['Switch'] },
      { name: 'vacuumDock', types: ['Switch'] },
      { name: 'vacuumBattery', types: ['Number', 'Dimmer'] },
      { name: 'vacuumLocate', types: ['Switch'] },
      { name: 'vacuumCurrentCycle', types: ['String'] }
    ];
  }

  static getAttributes(item) {
    const attributes = {
      pausable: false
    };

    const members = this.getMembers(item);
    if ('vacuumBattery' in members) {
      attributes.queryOnlyEnergyStorage = true;
    }

    return attributes;
  }

  static getState(item) {
    const state = {
      isRunning: false,
      isPaused: false
    };
    const config = this.getConfig(item);
    const members = this.getMembers(item);

    for (const member in members) {
      switch (member) {
        case 'vacuumPower': {
          let isRunning = members[member].state === 'ON';
          if (config.inverted === true) {
            isRunning = !isRunning;
          }
          state.isRunning = isRunning;
          state.isPaused = false; // Default to not paused when running/stopped
          break;
        }

        case 'vacuumDock':
          state.isDocked = members[member].state === 'ON';
          break;

        case 'vacuumBattery': {
          const batteryLevel = parseInt(members[member].state) || 0;
          state.descriptiveCapacityRemaining = 'FULL';
          state.capacityRemaining = [{ unit: 'PERCENTAGE', rawValue: batteryLevel }];
          if (batteryLevel <= 15) {
            state.descriptiveCapacityRemaining = 'CRITICALLY_LOW';
          } else if (batteryLevel <= 25) {
            state.descriptiveCapacityRemaining = 'LOW';
          } else if (batteryLevel <= 75) {
            state.descriptiveCapacityRemaining = 'MEDIUM';
          }
          break;
        }

        case 'vacuumCurrentCycle':
          state.currentRunCycle = [
            {
              currentCycle: members[member].state || 'unknown',
              lang: 'en'
            }
          ];
          break;
      }
    }
    return state;
  }
}

module.exports = Vacuum;

const DefaultDevice = require('./default.js');

class Washer extends DefaultDevice {
  static get type() {
    return 'action.devices.types.WASHER';
  }

  static getTraits(item) {
    const traits = [];
    const members = this.getMembers(item);

    if ('washerPower' in members) {
      traits.push('action.devices.traits.StartStop');
    }
    if ('washerTimerRemaining' in members || 'washerCurrentCycle' in members) {
      traits.push('action.devices.traits.RunCycle');
    }

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
      { name: 'washerTimerRemaining', types: ['Number'] },
      { name: 'washerCurrentCycle', types: ['String'] },
      { name: 'washerPower', types: ['Switch'] }
    ];
  }

  static getAttributes() {
    return { pausable: false };
  }

  static getState(item) {
    const state = {};
    const config = this.getConfig(item);
    const members = this.getMembers(item);

    if ('washerPower' in members) {
      let isRunning = members.washerPower.state === 'ON';
      if (config.inverted === true) {
        isRunning = !isRunning;
      }
      state.isRunning = isRunning;
      state.isPaused = false;
    }

    if ('washerTimerRemaining' in members || 'washerCurrentCycle' in members) {
      state.currentRunCycle = [
        {
          currentCycle: 'unknown',
          lang: 'en'
        }
      ];

      if ('washerCurrentCycle' in members) {
        state.currentRunCycle[0].currentCycle = members.washerCurrentCycle.state;
      }

      if ('washerTimerRemaining' in members) {
        const remaining = parseInt(members.washerTimerRemaining.state);
        if (!isNaN(remaining)) {
          const clamped = Math.max(0, remaining);
          state.currentTotalRemainingTime = clamped;
          state.currentCycleRemainingTime = clamped;
        }
      }
    }

    return state;
  }
}

module.exports = Washer;

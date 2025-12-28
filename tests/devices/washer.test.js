const Washer = require('../../functions/devices/washer.js');

describe('Washer Device', () => {
  test('matchesDeviceType without members', () => {
    expect(
      Washer.matchesDeviceType({
        metadata: {
          ga: {
            value: 'WASHER'
          }
        }
      })
    ).toBe(false);
  });

  test('matchesDeviceType with members', () => {
    expect(
      Washer.matchesDeviceType({
        metadata: {
          ga: {
            value: 'WASHER'
          }
        },
        members: [
          {
            name: 'WasherPower',
            state: 'ON',
            type: 'Switch',
            metadata: { ga: { value: 'washerPower' } }
          }
        ]
      })
    ).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Washer.matchesItemType({ type: 'Group' })).toBe(true);
    expect(Washer.matchesItemType({ type: 'Switch' })).toBe(false);
  });

  test('getTraits - Power only', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'WasherPower',
          type: 'Switch',
          metadata: { ga: { value: 'washerPower' } }
        }
      ]
    };
    const traits = Washer.getTraits(item);
    expect(traits).toContain('action.devices.traits.StartStop');
    expect(traits).not.toContain('action.devices.traits.RunCycle');
  });

  test('getTraits - Timer/RunCycle only', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'WasherTimerRemaining',
          type: 'Number',
          metadata: { ga: { value: 'washerTimerRemaining' } }
        }
      ]
    };
    const traits = Washer.getTraits(item);
    expect(traits).toContain('action.devices.traits.RunCycle');
    expect(traits).not.toContain('action.devices.traits.StartStop');
  });

  test('getState - Timer Active', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'WasherTimerRemaining',
          state: '1200',
          type: 'Number',
          metadata: { ga: { value: 'washerTimerRemaining' } }
        }
      ]
    };
    const state = Washer.getState(item);
    expect(state.currentTotalRemainingTime).toBe(1200);
    expect(state.currentCycleRemainingTime).toBe(1200);
    expect(state.currentRunCycle[0].currentCycle).toBe('unknown');
  });

  test('getState - Current Cycle', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'WasherCurrentCycle',
          state: 'rinse',
          type: 'String',
          metadata: { ga: { value: 'washerCurrentCycle' } }
        }
      ]
    };
    const state = Washer.getState(item);
    expect(state.currentRunCycle[0].currentCycle).toBe('rinse');
  });

  test('getState - Full State', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'WasherTimerRemaining',
          state: '600',
          type: 'Number',
          metadata: { ga: { value: 'washerTimerRemaining' } }
        },
        {
          name: 'WasherCurrentCycle',
          state: 'spin',
          type: 'String',
          metadata: { ga: { value: 'washerCurrentCycle' } }
        },
        {
          name: 'WasherPower',
          state: 'ON',
          type: 'Switch',
          metadata: { ga: { value: 'washerPower' } }
        }
      ]
    };
    const state = Washer.getState(item);
    expect(state.currentTotalRemainingTime).toBe(600);
    expect(state.currentCycleRemainingTime).toBe(600);
    expect(state.currentRunCycle[0].currentCycle).toBe('spin');
    expect(state.isRunning).toBe(true);
    expect(state.isPaused).toBe(false);
  });

  test('getState - Power inverted', () => {
    const item = {
      type: 'Group',
      metadata: {
        ga: {
          value: 'WASHER',
          config: { inverted: true }
        }
      },
      members: [
        {
          name: 'WasherPower',
          state: 'ON',
          type: 'Switch',
          metadata: { ga: { value: 'washerPower' } }
        }
      ]
    };

    expect(Washer.getState(item)).toStrictEqual({ isRunning: false, isPaused: false });

    item.members[0].state = 'OFF';
    expect(Washer.getState(item)).toStrictEqual({ isRunning: true, isPaused: false });
  });

  test('getState - Timer invalid values ignored', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'WasherTimerRemaining',
          state: 'not-a-number',
          type: 'Number',
          metadata: { ga: { value: 'washerTimerRemaining' } }
        }
      ]
    };
    const state = Washer.getState(item);
    expect(state.currentTotalRemainingTime).toBeUndefined();
    expect(state.currentCycleRemainingTime).toBeUndefined();
    expect(state.currentRunCycle[0].currentCycle).toBe('unknown');
  });

  test('getState - Timer zero and negative accepted', () => {
    const zeroItem = {
      type: 'Group',
      members: [
        {
          name: 'WasherTimerRemaining',
          state: '0',
          type: 'Number',
          metadata: { ga: { value: 'washerTimerRemaining' } }
        }
      ]
    };
    const zeroState = Washer.getState(zeroItem);
    expect(zeroState.currentTotalRemainingTime).toBe(0);
    expect(zeroState.currentCycleRemainingTime).toBe(0);

    const negativeItem = {
      type: 'Group',
      members: [
        {
          name: 'WasherTimerRemaining',
          state: '-10',
          type: 'Number',
          metadata: { ga: { value: 'washerTimerRemaining' } }
        }
      ]
    };
    const negativeState = Washer.getState(negativeItem);
    expect(negativeState.currentTotalRemainingTime).toBe(0);
    expect(negativeState.currentCycleRemainingTime).toBe(0);
    expect(negativeState.currentRunCycle[0].currentCycle).toBe('unknown');
  });

  test('getAttributes - pausable false', () => {
    expect(Washer.getAttributes()).toStrictEqual({ pausable: false });
  });
});

const PressureCooker = require('../../functions/devices/pressurecooker.js');

describe('PressureCooker Device', () => {
  test('matchesDeviceType without members', () => {
    expect(
      PressureCooker.matchesDeviceType({
        metadata: { ga: { value: 'PRESSURECOOKER' } }
      })
    ).toBe(false);
  });

  test('matchesDeviceType with members', () => {
    expect(
      PressureCooker.matchesDeviceType({
        metadata: { ga: { value: 'PRESSURECOOKER' } },
        members: [
          {
            name: 'PressureCookerPower',
            state: 'ON',
            type: 'Switch',
            metadata: { ga: { value: 'pressureCookerPower' } }
          }
        ]
      })
    ).toBe(true);
  });

  test('matchesItemType', () => {
    expect(PressureCooker.matchesItemType({ type: 'Group' })).toBe(true);
    expect(PressureCooker.matchesItemType({ type: 'Switch' })).toBe(false);
  });

  describe('getTraits', () => {
    test('Power only', () => {
      const item = {
        type: 'Group',
        members: [{ name: 'PressureCookerPower', type: 'Switch', metadata: { ga: { value: 'pressureCookerPower' } } }]
      };
      expect(PressureCooker.getTraits(item)).toStrictEqual(['action.devices.traits.OnOff']);
    });

    test('Running only', () => {
      const item = {
        type: 'Group',
        members: [
          { name: 'PressureCookerRunning', type: 'Switch', metadata: { ga: { value: 'pressureCookerRunning' } } }
        ]
      };
      expect(PressureCooker.getTraits(item)).toStrictEqual(['action.devices.traits.StartStop']);
    });

    test('All members', () => {
      const item = {
        type: 'Group',
        members: [
          { name: 'PressureCookerPower', type: 'Switch', metadata: { ga: { value: 'pressureCookerPower' } } },
          { name: 'PressureCookerRunning', type: 'Switch', metadata: { ga: { value: 'pressureCookerRunning' } } }
        ]
      };
      expect(PressureCooker.getTraits(item)).toStrictEqual([
        'action.devices.traits.OnOff',
        'action.devices.traits.StartStop'
      ]);
    });
  });

  describe('getState', () => {
    test('Power', () => {
      const item = {
        members: [
          {
            name: 'PressureCookerPower',
            state: 'ON',
            type: 'Switch',
            metadata: { ga: { value: 'pressureCookerPower' } }
          }
        ]
      };
      expect(PressureCooker.getState(item)).toStrictEqual({ on: true });
    });

    test('Power inverted', () => {
      const item = {
        metadata: { ga: { value: 'PRESSURECOOKER', config: { inverted: true } } },
        members: [
          {
            name: 'PressureCookerPower',
            state: 'ON',
            type: 'Switch',
            metadata: { ga: { value: 'pressureCookerPower' } }
          }
        ]
      };
      expect(PressureCooker.getState(item)).toStrictEqual({ on: false });
    });

    test('Running', () => {
      const item = {
        members: [
          {
            name: 'PressureCookerRunning',
            state: 'ON',
            type: 'Switch',
            metadata: { ga: { value: 'pressureCookerRunning' } }
          }
        ]
      };
      expect(PressureCooker.getState(item)).toStrictEqual({ isRunning: true, isPaused: false });
    });

    test('Running inverted', () => {
      const item = {
        metadata: { ga: { value: 'PRESSURECOOKER', config: { inverted: true } } },
        members: [
          {
            name: 'PressureCookerRunning',
            state: 'ON',
            type: 'Switch',
            metadata: { ga: { value: 'pressureCookerRunning' } }
          }
        ]
      };
      expect(PressureCooker.getState(item)).toStrictEqual({ isRunning: false, isPaused: false });
    });
  });

  describe('getAttributes', () => {
    test('no relevant members', () => {
      expect(PressureCooker.getAttributes({})).toStrictEqual({});
    });

    test('running only', () => {
      const item = {
        members: [
          { name: 'PressureCookerRunning', type: 'Switch', metadata: { ga: { value: 'pressureCookerRunning' } } }
        ]
      };
      expect(PressureCooker.getAttributes(item)).toStrictEqual({ pausable: false });
    });
  });
});

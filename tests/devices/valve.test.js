const Device = require('../../functions/devices/valve.js');

describe('Valve Device', () => {
  test('matchesDeviceType', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'VALVE'
          }
        }
      })
    ).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ type: 'Switch' })).toBe(true);
    expect(Device.matchesItemType({ type: 'String' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Switch' })).toBe(true);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'String' })).toBe(false);
  });

  describe('getState', () => {
    test('getState', () => {
      expect(Device.getState({ state: 'ON' })).toStrictEqual({
        openPercent: 100
      });
      expect(Device.getState({ state: 'OFF' })).toStrictEqual({
        openPercent: 0
      });
    });

    test('getState inverted', () => {
      const item = {
        state: 'ON',
        metadata: {
          ga: {
            config: {
              inverted: true
            }
          }
        }
      };
      expect(Device.getState(item)).toStrictEqual({
        openPercent: 0
      });
      item.state = 'OFF';
      expect(Device.getState(item)).toStrictEqual({
        openPercent: 100
      });
    });
  });
});

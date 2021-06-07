const Device = require('../../functions/devices/securitysystem.js');

describe('SecuritySystem Device', () => {
  test('matchesDeviceType', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'SECURITYSYSTEM'
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
        isArmed: true
      });
      expect(Device.getState({ state: 'OFF' })).toStrictEqual({
        isArmed: false
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
        isArmed: false
      });
    });
  });
});

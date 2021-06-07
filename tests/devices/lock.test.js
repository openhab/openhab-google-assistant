const Device = require('../../functions/devices/lock.js');

describe('Lock Device', () => {
  test('matchesDeviceType', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'LOCK'
          }
        }
      })
    ).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ type: 'Switch' })).toBe(true);
    expect(Device.matchesItemType({ type: 'Contact' })).toBe(true);
    expect(Device.matchesItemType({ type: 'String' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Switch' })).toBe(true);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Contact' })).toBe(true);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'String' })).toBe(false);
  });

  describe('getState', () => {
    test('getState Switch', () => {
      expect(Device.getState({ state: 'ON' })).toStrictEqual({
        isLocked: true
      });
      expect(Device.getState({ state: 'OFF' })).toStrictEqual({
        isLocked: false
      });
    });

    test('getState Contact', () => {
      expect(Device.getState({ state: 'CLOSED' })).toStrictEqual({
        isLocked: true
      });
      expect(Device.getState({ state: 'OPEN' })).toStrictEqual({
        isLocked: false
      });
    });

    test('getState inverted Swtich', () => {
      const item1 = {
        state: 'ON',
        metadata: {
          ga: {
            config: {
              inverted: true
            }
          }
        }
      };
      expect(Device.getState(item1)).toStrictEqual({
        isLocked: false
      });
    });

    test('getState inverted Contact', () => {
      const item2 = {
        state: 'OPEN',
        metadata: {
          ga: {
            config: {
              inverted: true
            }
          }
        }
      };
      expect(Device.getState(item2)).toStrictEqual({
        isLocked: true
      });
    });
  });
});

const Device = require('../../functions/devices/switch.js');

describe('Switch Device', () => {
  test('matchesDeviceType', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'SWITCH'
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

  test('getState', () => {
    expect(Device.getState({ state: 'ON' })).toStrictEqual({
      on: true
    });
    expect(Device.getState({ state: 'OFF' })).toStrictEqual({
      on: false
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
      on: false
    });
    item.state = 'OFF';
    expect(Device.getState(item)).toStrictEqual({
      on: true
    });
  });
});

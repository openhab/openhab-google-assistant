const Device = require('../../functions/devices/humiditysensor.js');

describe('HumiditySensor Device', () => {
  test('isCompatible', () => {
    expect(
      Device.isCompatible({
        metadata: {
          ga: {
            value: 'humiditysensor'
          }
        }
      })
    ).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ type: 'Number' })).toBe(true);
    expect(Device.matchesItemType({ type: 'Number:Humidity' })).toBe(true);
    expect(Device.matchesItemType({ type: 'Dimmer' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Dimmer' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Number' })).toBe(true);
  });

  describe('getAttributes', () => {
    test('getAttributes no config', () => {
      expect(Device.getAttributes()).toStrictEqual({
        queryOnlyHumiditySetting: true
      });
    });
  });

  test('getState', () => {
    expect(Device.getState({ state: '10.3' })).toStrictEqual({
      humidityAmbientPercent: 10,
      humiditySetpointPercent: 10
    });
  });
});

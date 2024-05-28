const Device = require('../../functions/devices/humiditysensor.js');

describe('HumiditySensor Device', () => {
  test('matchesDeviceType', () => {
    expect(
      Device.matchesDeviceType({
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

  describe('getAttributes', () => {
    test('getState no config', () => {
      expect(Device.getState({ state: '9.6 %' })).toStrictEqual({
        humidityAmbientPercent: 10,
        humiditySetpointPercent: 10
      });
    });

    test('getState humidityUnit float', () => {
      expect(Device.getState({ state: '0.34', metadata: { ga: { config: { humidityUnit: 'float' } } } })).toStrictEqual(
        {
          humidityAmbientPercent: 34,
          humiditySetpointPercent: 34
        }
      );
    });
  });
});

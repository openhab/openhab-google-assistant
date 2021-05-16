const Device = require('../../functions/devices/temperaturesensor.js');

describe('TemperatureSensor Device', () => {
  test('isCompatible', () => {
    expect(
      Device.isCompatible({
        metadata: {
          ga: {
            value: 'temperaturesensor'
          }
        }
      })
    ).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ type: 'Number' })).toBe(true);
    expect(Device.matchesItemType({ type: 'Number:Temperature' })).toBe(true);
    expect(Device.matchesItemType({ type: 'Dimmer' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Dimmer' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Number' })).toBe(true);
  });

  describe('getAttributes', () => {
    test('getAttributes no config', () => {
      const item1 = {
        metadata: {
          ga: {
            config: {}
          }
        }
      };
      expect(Device.getAttributes(item1)).toStrictEqual({
        queryOnlyTemperatureControl: true,
        temperatureUnitForUX: 'C'
      });
    });

    test('getAttributes useFahrenheit', () => {
      const item2 = {
        metadata: {
          ga: {
            config: {
              useFahrenheit: true
            }
          }
        }
      };
      expect(Device.getAttributes(item2)).toStrictEqual({
        queryOnlyTemperatureControl: true,
        temperatureUnitForUX: 'F'
      });
    });
  });

  test('getState', () => {
    expect(Device.getState({ state: '10' })).toStrictEqual({
      temperatureSetpointCelsius: 10,
      temperatureAmbientCelsius: 10
    });
    const item = {
      state: '10',
      metadata: {
        ga: {
          config: {
            useFahrenheit: true
          }
        }
      }
    };
    expect(Device.getState(item)).toStrictEqual({
      temperatureSetpointCelsius: -12.2,
      temperatureAmbientCelsius: -12.2
    });
  });
});

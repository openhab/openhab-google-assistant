const Device = require('../../functions/devices/temperaturesensor.js');

describe('TemperatureSensor Device', () => {
  test('matchesDeviceType', () => {
    expect(
      Device.matchesDeviceType({
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
      const item = {
        metadata: {
          ga: {
            config: {}
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        queryOnlyTemperatureControl: true,
        queryOnlyTemperatureSetting: true,
        temperatureUnitForUX: 'C',
        thermostatTemperatureUnit: 'C',
        temperatureRange: {
          maxThresholdCelsius: 100,
          minThresholdCelsius: -100
        }
      });
    });

    test('getAttributes useFahrenheit', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              useFahrenheit: true
            }
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        queryOnlyTemperatureControl: true,
        queryOnlyTemperatureSetting: true,
        temperatureUnitForUX: 'F',
        thermostatTemperatureUnit: 'F',
        temperatureRange: {
          maxThresholdCelsius: 100,
          minThresholdCelsius: -100
        }
      });
    });

    test('getAttributes temperatureRange', () => {
      const item1 = {
        metadata: {
          ga: {
            config: {
              temperatureRange: '-20,40'
            }
          }
        }
      };
      expect(Device.getAttributes(item1)).toStrictEqual({
        queryOnlyTemperatureControl: true,
        queryOnlyTemperatureSetting: true,
        temperatureUnitForUX: 'C',
        thermostatTemperatureUnit: 'C',
        temperatureRange: {
          maxThresholdCelsius: 40,
          minThresholdCelsius: -20
        }
      });
    });
  });

  test('getState', () => {
    expect(Device.getState({ state: '10' })).toStrictEqual({
      thermostatTemperatureAmbient: 10,
      temperatureAmbientCelsius: 10,
      temperatureSetpointCelsius: 10
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
      thermostatTemperatureAmbient: -12.2,
      temperatureAmbientCelsius: -12.2,
      temperatureSetpointCelsius: -12.2
    });
  });
});

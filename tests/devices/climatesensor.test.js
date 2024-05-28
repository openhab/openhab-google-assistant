const Device = require('../../functions/devices/climatesensor.js');

describe('ClimateSensor Device', () => {
  test('matchesDeviceType', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'climatesensor'
          }
        }
      })
    ).toBe(false);
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'climatesensor'
          }
        },
        members: [
          {
            type: 'Number',
            metadata: {
              ga: {
                value: 'temperatureAmbient'
              }
            }
          }
        ]
      })
    ).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ type: 'Number' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Number:Temperature' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Dimmer' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Number' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group' })).toBe(true);
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
      expect(Device.getAttributes(item)).toStrictEqual({});
    });

    test('getAttributes humidity', () => {
      const item = {
        metadata: {
          ga: {
            config: {}
          }
        },
        members: [
          {
            name: 'Humidity',
            state: '60',
            type: 'Number',
            metadata: {
              ga: {
                value: 'humidityAmbient'
              }
            }
          }
        ]
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        queryOnlyHumiditySetting: true
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
        },
        members: [
          {
            name: 'Temperature',
            state: '20',
            type: 'Number',
            metadata: {
              ga: {
                value: 'temperatureAmbient'
              }
            }
          }
        ]
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
      const item = {
        metadata: {
          ga: {
            config: {
              temperatureRange: '0,30'
            }
          }
        },
        members: [
          {
            name: 'Temperature',
            state: '20',
            type: 'Number',
            metadata: {
              ga: {
                value: 'temperatureAmbient'
              }
            }
          }
        ]
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        queryOnlyTemperatureControl: true,
        queryOnlyTemperatureSetting: true,
        temperatureUnitForUX: 'C',
        thermostatTemperatureUnit: 'C',
        temperatureRange: {
          maxThresholdCelsius: 30,
          minThresholdCelsius: 0
        }
      });
    });
  });

  test('getState', () => {
    const item1 = {
      members: [
        {
          name: 'Temperature',
          state: '20',
          type: 'Number',
          metadata: {
            ga: {
              value: 'temperatureAmbient'
            }
          }
        },
        {
          name: 'Humidity',
          state: '59.7 %',
          type: 'Number',
          metadata: {
            ga: {
              value: 'humidityAmbient'
            }
          }
        }
      ]
    };
    expect(Device.getState(item1)).toStrictEqual({
      thermostatTemperatureAmbient: 20,
      temperatureAmbientCelsius: 20,
      temperatureSetpointCelsius: 20,
      humidityAmbientPercent: 60,
      humiditySetpointPercent: 60
    });
    const item2 = {
      members: [
        {
          name: 'Temperature',
          state: '10',
          type: 'Number',
          metadata: {
            ga: {
              value: 'temperatureAmbient'
            }
          }
        }
      ],
      metadata: {
        ga: {
          config: {
            useFahrenheit: true
          }
        }
      }
    };
    expect(Device.getState(item2)).toStrictEqual({
      thermostatTemperatureAmbient: -12.2,
      temperatureSetpointCelsius: -12.2,
      temperatureAmbientCelsius: -12.2
    });
    const item3 = {
      members: [
        {
          name: 'Humidity',
          state: '30.3 %',
          type: 'Number',
          metadata: {
            ga: {
              value: 'humidityAmbient'
            }
          }
        }
      ]
    };
    expect(Device.getState(item3)).toStrictEqual({
      humidityAmbientPercent: 30,
      humiditySetpointPercent: 30
    });
    const item4 = {
      metadata: {
        ga: {
          config: {
            humidityUnit: 'float'
          }
        }
      },
      members: [
        {
          name: 'Humidity',
          state: '0.45',
          type: 'Number',
          metadata: {
            ga: {
              value: 'humidityAmbient'
            }
          }
        }
      ]
    };
    expect(Device.getState(item4)).toStrictEqual({
      humidityAmbientPercent: 45,
      humiditySetpointPercent: 45
    });
  });
});

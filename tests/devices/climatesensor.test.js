const Device = require('../../functions/devices/climatesensor.js');

describe('ClimateSensor Device', () => {
  test('isCompatible', () => {
    expect(
      Device.isCompatible({
        metadata: {
          ga: {
            value: 'climatesensor'
          }
        }
      })
    ).toBe(false);
    expect(
      Device.isCompatible({
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
    const item = {
      type: 'Group',
      members: [
        {
          metadata: {
            ga: {
              value: 'temperatureAmbient'
            }
          }
        }
      ]
    };
    expect(Device.matchesItemType({ type: 'Number' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Number:Temperature' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Dimmer' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Number' })).toBe(false);
    expect(Device.matchesItemType(item)).toBe(true);
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
        queryOnlyTemperatureSetting: true,
        thermostatTemperatureUnit: 'F'
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
    expect(Device.getState(item1)).toStrictEqual({
      thermostatTemperatureAmbient: 20,
      humidityAmbientPercent: 60
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
      thermostatTemperatureAmbient: -12.2
    });
  });
});

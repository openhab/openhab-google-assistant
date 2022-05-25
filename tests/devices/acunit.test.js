const Device = require('../../functions/devices/acunit.js');

describe('ACUnit Device', () => {
  test('isCompatible', () => {
    expect(
      Device.isCompatible({
        metadata: {
          ga: {
            value: 'AC_UNIT'
          }
        }
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
              value: 'fanPower'
            }
          }
        }
      ]
    };
    expect(Device.matchesItemType(item)).toBe(true);
    expect(Device.matchesItemType({ type: 'Group' })).toBe(false);
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
        availableThermostatModes: ['off', 'heat', 'cool', 'on', 'heatcool', 'auto', 'eco'],
        thermostatTemperatureUnit: 'C'
      });
    });

    test('getAttributes modes, fahrenheit', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              modes: 'on=1,off=2',
              useFahrenheit: true
            }
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        availableThermostatModes: ['on', 'off'],
        thermostatTemperatureUnit: 'F'
      });
    });

    test('getAttributes temperaturerange', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              thermostatTemperatureRange: '10,30'
            }
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        availableThermostatModes: ['off', 'heat', 'cool', 'on', 'heatcool', 'auto', 'eco'],
        thermostatTemperatureUnit: 'C',
        thermostatTemperatureRange: {
          maxThresholdCelsius: 30,
          minThresholdCelsius: 10
        }
      });
    });

    test('getAttributes invalid temperaturerange', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              thermostatTemperatureRange: 'a,b'
            }
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        availableThermostatModes: ['off', 'heat', 'cool', 'on', 'heatcool', 'auto', 'eco'],
        thermostatTemperatureUnit: 'C'
      });
    });

    test('getAttributes queryOnly', () => {
      const item = {
        metadata: {
          ga: {
            config: {}
          }
        },
        members: [
          {
            metadata: {
              ga: {
                value: 'thermostatTemperatureAmbient'
              }
            }
          }
        ]
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        thermostatTemperatureUnit: 'C',
        queryOnlyTemperatureSetting: true
      });
    });

    test('getAttributes speeds', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              ordered: true,
              speeds: '0=null:off,50=slow,100=full:fast'
            }
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        availableThermostatModes: ['off', 'heat', 'cool', 'on', 'heatcool', 'auto', 'eco'],
        availableFanSpeeds: {
          speeds: [
            {
              speed_name: '0',
              speed_values: [
                {
                  speed_synonym: ['null', 'off'],
                  lang: 'en'
                }
              ]
            },
            {
              speed_name: '50',
              speed_values: [
                {
                  speed_synonym: ['slow'],
                  lang: 'en'
                }
              ]
            },
            {
              speed_name: '100',
              speed_values: [
                {
                  speed_synonym: ['full', 'fast'],
                  lang: 'en'
                }
              ]
            }
          ],
          ordered: true
        },
        thermostatTemperatureUnit: 'C'
      });
    });
  });

  describe('getMembers', () => {
    expect(Device.getMembers({ members: [{}] })).toStrictEqual({});
    expect(Device.getMembers({ members: [{ metadata: { ga: { value: 'invalid' } } }] })).toStrictEqual({});
    test('getMembers', () => {
      const item = {
        members: [
          {
            name: 'Mode',
            state: 'on',
            metadata: {
              ga: {
                value: 'thermostatMode'
              }
            }
          },
          {
            name: 'Setpoint',
            state: '20',
            metadata: {
              ga: {
                value: 'thermostatTemperatureSetpoint'
              }
            }
          },
          {
            name: 'High',
            state: '25',
            metadata: {
              ga: {
                value: 'thermostatTemperatureSetpointHigh'
              }
            }
          },
          {
            name: 'Low',
            state: '5',
            metadata: {
              ga: {
                value: 'thermostatTemperatureSetpointLow'
              }
            }
          },
          {
            name: 'Temperature',
            state: '20',
            metadata: {
              ga: {
                value: 'thermostatTemperatureAmbient'
              }
            }
          },
          {
            name: 'Humidity',
            state: '50',
            metadata: {
              ga: {
                value: 'thermostatHumidityAmbient'
              }
            }
          },
          {
            name: 'FanSpeed',
            state: '20',
            metadata: {
              ga: {
                value: 'fanSpeed'
              }
            }
          },
          {
            name: 'FanPower',
            state: 'ON',
            metadata: {
              ga: {
                value: 'fanPower'
              }
            }
          }
        ]
      };
      expect(Device.getMembers(item)).toStrictEqual({
        fanPower: {
          name: 'FanPower',
          state: 'ON'
        },
        fanSpeed: {
          name: 'FanSpeed',
          state: '20'
        },
        thermostatMode: {
          name: 'Mode',
          state: 'on'
        },
        thermostatTemperatureSetpoint: {
          name: 'Setpoint',
          state: '20'
        },
        thermostatTemperatureSetpointHigh: {
          name: 'High',
          state: '25'
        },
        thermostatTemperatureSetpointLow: {
          name: 'Low',
          state: '5'
        },
        thermostatTemperatureAmbient: {
          name: 'Temperature',
          state: '20'
        },
        thermostatHumidityAmbient: {
          name: 'Humidity',
          state: '50'
        }
      });
    });
  });

  describe('getState', () => {
    test('getState', () => {
      const item = {
        members: [
          {
            name: 'Mode',
            state: 'on',
            metadata: {
              ga: {
                value: 'thermostatMode'
              }
            }
          },
          {
            name: 'Setpoint',
            state: '20',
            metadata: {
              ga: {
                value: 'thermostatTemperatureSetpoint'
              }
            }
          },
          {
            name: 'High',
            state: '25',
            metadata: {
              ga: {
                value: 'thermostatTemperatureSetpointHigh'
              }
            }
          },
          {
            name: 'Low',
            state: '5',
            metadata: {
              ga: {
                value: 'thermostatTemperatureSetpointLow'
              }
            }
          },
          {
            name: 'Temperature',
            state: '20',
            metadata: {
              ga: {
                value: 'thermostatTemperatureAmbient'
              }
            }
          },
          {
            name: 'Humidity',
            state: '50',
            metadata: {
              ga: {
                value: 'thermostatHumidityAmbient'
              }
            }
          },
          {
            name: 'FanSpeed',
            state: '20',
            metadata: {
              ga: {
                value: 'fanSpeed'
              }
            }
          },
          {
            name: 'FanPower',
            state: 'ON',
            metadata: {
              ga: {
                value: 'fanPower'
              }
            }
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        currentFanSpeedSetting: '20',
        on: true,
        thermostatHumidityAmbient: 50,
        thermostatMode: 'on',
        thermostatTemperatureAmbient: 20,
        thermostatTemperatureSetpoint: 20,
        thermostatTemperatureSetpointHigh: 25,
        thermostatTemperatureSetpointLow: 5
      });
    });
  });
});

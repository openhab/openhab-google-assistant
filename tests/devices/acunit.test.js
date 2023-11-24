const Device = require('../../functions/devices/acunit.js');

describe('ACUnit Device', () => {
  test('matchesDeviceType', () => {
    expect(
      Device.matchesDeviceType({
        type: 'Group',
        metadata: {
          ga: {
            value: 'AC_Unit'
          }
        }
      })
    ).toBe(false);
    expect(
      Device.matchesDeviceType({
        type: 'Group',
        metadata: {
          ga: {
            value: 'AC_Unit'
          }
        },
        members: [
          {
            type: 'Number',
            state: '10',
            metadata: {
              ga: {
                value: 'fanSpeed'
              }
            }
          }
        ]
      })
    ).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ type: 'Dimmer' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group' })).toBe(true);
  });

  describe('getTraits', () => {
    const item = {
      members: [
        {
          type: 'Switch',
          state: 'ON',
          metadata: {
            ga: {
              value: 'fanPower'
            }
          }
        },
        {
          type: 'Dimmer',
          state: '50',
          metadata: {
            ga: {
              value: 'fanSpeed'
            }
          }
        },
        {
          type: 'String',
          state: 'Mode1',
          metadata: {
            ga: {
              value: 'fanMode'
            }
          }
        },
        {
          type: 'Number',
          state: '10',
          metadata: {
            ga: {
              value: 'fanFilterLifeTime'
            }
          }
        }
      ]
    };
    expect(Device.getTraits(item)).toStrictEqual([
      'action.devices.traits.OnOff',
      'action.devices.traits.FanSpeed',
      'action.devices.traits.Modes',
      'action.devices.traits.SensorState',
      'action.devices.traits.TemperatureSetting'
    ]);
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
        thermostatTemperatureUnit: 'C',
        supportsFanSpeedPercent: true
      });
    });
  });

  describe('getState', () => {
    test('getState', () => {
      const item = {
        type: 'Group',
        members: [
          {
            name: 'Mode',
            type: 'String',
            state: 'on',
            metadata: {
              ga: {
                value: 'thermostatMode'
              }
            }
          },
          {
            name: 'Setpoint',
            type: 'Number',
            state: '20',
            metadata: {
              ga: {
                value: 'thermostatTemperatureSetpoint'
              }
            }
          },
          {
            name: 'High',
            type: 'Number',
            state: '25',
            metadata: {
              ga: {
                value: 'thermostatTemperatureSetpointHigh'
              }
            }
          },
          {
            name: 'Low',
            type: 'Number',
            state: '5',
            metadata: {
              ga: {
                value: 'thermostatTemperatureSetpointLow'
              }
            }
          },
          {
            name: 'Temperature',
            type: 'Number',
            state: '20',
            metadata: {
              ga: {
                value: 'thermostatTemperatureAmbient'
              }
            }
          },
          {
            name: 'Humidity',
            type: 'Number',
            state: '50',
            metadata: {
              ga: {
                value: 'thermostatHumidityAmbient'
              }
            }
          },
          {
            name: 'FanSpeed',
            type: 'Number',
            state: '20',
            metadata: {
              ga: {
                value: 'fanSpeed'
              }
            }
          },
          {
            name: 'FanPower',
            type: 'Switch',
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
        currentFanSpeedPercent: 20,
        on: true,
        thermostatHumidityAmbient: 50,
        thermostatMode: 'on',
        thermostatTemperatureAmbient: 20,
        thermostatTemperatureSetpoint: 20,
        thermostatTemperatureSetpointHigh: 25,
        thermostatTemperatureSetpointLow: 5
      });
    });

    test('getState speeds', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            config: {
              ordered: true,
              fanSpeeds: '0=null:off,50=slow,100=full:fast',
              lang: 'en'
            }
          }
        },
        members: [
          {
            name: 'FanSpeed',
            state: '50',
            type: 'Number',
            metadata: {
              ga: {
                value: 'fanSpeed'
              }
            }
          },
          {
            name: 'FanPower',
            state: 'ON',
            type: 'Switch',
            metadata: {
              ga: {
                value: 'fanPower'
              }
            }
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        currentFanSpeedPercent: 50,
        currentFanSpeedSetting: '50',
        on: true
      });
    });
  });
});

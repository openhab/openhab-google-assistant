const Device = require('../../functions/devices/humidifier.js');

describe('Humidifier Device', () => {
  test('type', () => {
    expect(Device.type).toBe('action.devices.types.HUMIDIFIER');
  });

  test('matchesDeviceType', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'Humidifier'
          }
        }
      })
    ).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ type: 'Group' })).toBe(true);
    expect(Device.matchesItemType({ type: 'Switch' })).toBe(true);
    expect(Device.matchesItemType({ type: 'Dimmer' })).toBe(true);
    expect(Device.matchesItemType({ type: 'Number' })).toBe(true);
    expect(Device.matchesItemType({ type: 'String' })).toBe(false);
  });

  test('matchesDeviceType - Group with members', () => {
    expect(
      Device.matchesDeviceType({
        type: 'Group',
        metadata: {
          ga: {
            value: 'Humidifier'
          }
        },
        members: [
          {
            type: 'Switch',
            state: 'ON',
            metadata: {
              ga: {
                value: 'humidifierPower'
              }
            }
          }
        ]
      })
    ).toBe(true);
  });

  test('matchesDeviceType - Group without members', () => {
    expect(
      Device.matchesDeviceType({
        type: 'Group',
        metadata: {
          ga: {
            value: 'Humidifier'
          }
        },
        members: []
      })
    ).toBe(false);
  });

  describe('getTraits', () => {
    test('getTraits Switch item', () => {
      const item = {
        type: 'Switch'
      };
      expect(Device.getTraits(item)).toStrictEqual(['action.devices.traits.OnOff']);
    });

    test('getTraits Dimmer item', () => {
      const item = {
        type: 'Dimmer'
      };
      expect(Device.getTraits(item)).toStrictEqual([
        'action.devices.traits.OnOff',
        'action.devices.traits.HumiditySetting'
      ]);
    });

    test('getTraits Group with all members', () => {
      const item = {
        type: 'Group',
        members: [
          {
            type: 'Switch',
            state: 'ON',
            metadata: {
              ga: {
                value: 'humidifierPower'
              }
            }
          },
          {
            type: 'Number',
            state: '60',
            metadata: {
              ga: {
                value: 'humidifierHumiditySetpoint'
              }
            }
          },
          {
            type: 'Number',
            state: '75',
            metadata: {
              ga: {
                value: 'humidifierFanSpeed'
              }
            }
          }
        ]
      };
      expect(Device.getTraits(item)).toStrictEqual([
        'action.devices.traits.OnOff',
        'action.devices.traits.HumiditySetting',
        'action.devices.traits.FanSpeed'
      ]);
    });

    test('getTraits Group minimal members', () => {
      const item = {
        type: 'Group',
        members: [
          {
            type: 'Switch',
            state: 'ON',
            metadata: {
              ga: {
                value: 'humidifierPower'
              }
            }
          }
        ]
      };
      expect(Device.getTraits(item)).toStrictEqual(['action.devices.traits.OnOff']);
    });
  });

  describe('getAttributes', () => {
    test('getAttributes with humidity setpoint', () => {
      const item = {
        type: 'Group',
        members: [
          {
            type: 'Number',
            state: '60',
            metadata: {
              ga: {
                value: 'humidifierHumiditySetpoint'
              }
            }
          }
        ]
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        humiditySetpointRange: {
          minPercent: 0,
          maxPercent: 100
        }
      });
    });

    test('getAttributes Switch item (no humidity attributes)', () => {
      const item = {
        type: 'Switch'
      };
      expect(Device.getAttributes(item)).toStrictEqual({});
    });

    test('getAttributes Dimmer item (has humidity attributes)', () => {
      const item = {
        type: 'Dimmer'
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        humiditySetpointRange: {
          minPercent: 0,
          maxPercent: 100
        }
      });
    });

    test('getAttributes Number item (has humidity attributes)', () => {
      const item = {
        type: 'Number'
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        humiditySetpointRange: {
          minPercent: 0,
          maxPercent: 100
        }
      });
    });

    test('getAttributes with custom humidity range', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            config: {
              humidityRange: '30,80'
            }
          }
        },
        members: [
          {
            type: 'Number',
            state: '60',
            metadata: {
              ga: {
                value: 'humidifierHumiditySetpoint'
              }
            }
          }
        ]
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        humiditySetpointRange: {
          minPercent: 30,
          maxPercent: 80
        }
      });
    });

    test('getAttributes with fan speed', () => {
      const item = {
        type: 'Group',
        members: [
          {
            type: 'Number',
            state: '50',
            metadata: {
              ga: {
                value: 'humidifierFanSpeed'
              }
            }
          }
        ]
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        supportsFanSpeedPercent: true
      });
    });

    test('getAttributes with fan speeds config', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            config: {
              fanSpeeds: 'low=Low:Slow, high=High:Fast',
              ordered: true,
              lang: 'de'
            }
          }
        },
        members: [
          {
            type: 'Number',
            state: '50',
            metadata: {
              ga: {
                value: 'humidifierFanSpeed'
              }
            }
          }
        ]
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        supportsFanSpeedPercent: true,
        availableFanSpeeds: {
          speeds: [
            {
              speed_name: 'low',
              speed_values: [
                {
                  speed_synonym: ['Low', 'Slow'],
                  lang: 'de'
                }
              ]
            },
            {
              speed_name: 'high',
              speed_values: [
                {
                  speed_synonym: ['High', 'Fast'],
                  lang: 'de'
                }
              ]
            }
          ],
          ordered: true
        }
      });
    });
  });

  describe('getMetadata', () => {
    test('getMetadata copies maxHumidity to customData', () => {
      const item = {
        type: 'Switch',
        metadata: {
          ga: {
            value: 'Humidifier',
            config: {
              maxHumidity: 50
            }
          }
        }
      };
      const metadata = Device.getMetadata(item);
      expect(metadata.customData.maxHumidity).toBe(50);
    });

    test('getMetadata without maxHumidity config', () => {
      const item = {
        type: 'Switch',
        metadata: {
          ga: {
            value: 'Humidifier'
          }
        }
      };
      const metadata = Device.getMetadata(item);
      expect(metadata.customData.maxHumidity).toBeUndefined();
    });
  });

  describe('getState', () => {
    test('getState Switch item ON', () => {
      const item = {
        type: 'Switch',
        state: 'ON'
      };
      expect(Device.getState(item)).toStrictEqual({
        on: true
      });
    });

    test('getState Switch item OFF', () => {
      const item = {
        type: 'Switch',
        state: 'OFF'
      };
      expect(Device.getState(item)).toStrictEqual({
        on: false
      });
    });

    test('getState Dimmer item', () => {
      const item = {
        type: 'Dimmer',
        state: '65'
      };
      expect(Device.getState(item)).toStrictEqual({
        on: true,
        humiditySetpointPercent: 65
      });
    });

    test('getState Dimmer item OFF', () => {
      const item = {
        type: 'Dimmer',
        state: '0'
      };
      expect(Device.getState(item)).toStrictEqual({
        on: false,
        humiditySetpointPercent: 0
      });
    });

    test('getState Group with all members', () => {
      const item = {
        type: 'Group',
        members: [
          {
            name: 'Power',
            type: 'Switch',
            state: 'ON',
            metadata: {
              ga: {
                value: 'humidifierPower'
              }
            }
          },
          {
            name: 'Setpoint',
            type: 'Number',
            state: '60',
            metadata: {
              ga: {
                value: 'humidifierHumiditySetpoint'
              }
            }
          },
          {
            name: 'Ambient',
            type: 'Number',
            state: '45',
            metadata: {
              ga: {
                value: 'humidifierHumidityAmbient'
              }
            }
          },
          {
            name: 'FanSpeed',
            type: 'Number',
            state: '75',
            metadata: {
              ga: {
                value: 'humidifierFanSpeed'
              }
            }
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        on: true,
        humiditySetpointPercent: 60,
        humidityAmbientPercent: 45,
        currentFanSpeedPercent: 75
      });
    });

    test('getState Group with maxHumidity config', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            config: {
              maxHumidity: 1
            }
          }
        },
        members: [
          {
            name: 'Setpoint',
            type: 'Number',
            state: '0.6',
            metadata: {
              ga: {
                value: 'humidifierHumiditySetpoint'
              }
            }
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        humiditySetpointPercent: 60
      });
    });

    test('getState Group with fanSpeeds config', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            config: {
              fanSpeeds: 'low=Low, high=High'
            }
          }
        },
        members: [
          {
            name: 'FanSpeed',
            type: 'Number',
            state: '50',
            metadata: {
              ga: {
                value: 'humidifierFanSpeed'
              }
            }
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        currentFanSpeedPercent: 50,
        currentFanSpeedSetting: '50'
      });
    });
  });

  test('supportedMembers', () => {
    expect(Device.supportedMembers).toStrictEqual([
      { name: 'humidifierPower', types: ['Switch'] },
      { name: 'humidifierHumiditySetpoint', types: ['Number', 'Dimmer'] },
      { name: 'humidifierHumidityAmbient', types: ['Number'] },
      { name: 'humidifierFanSpeed', types: ['Number', 'Dimmer'] }
    ]);
  });
});

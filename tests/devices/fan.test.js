const Device = require('../../functions/devices/fan.js');

describe('Fan Device', () => {
  test('matchesDeviceType', () => {
    expect(
      Device.matchesDeviceType({
        type: 'Dimmer',
        metadata: {
          ga: {
            value: 'FAN'
          }
        }
      })
    ).toBe(true);
    expect(
      Device.matchesDeviceType({
        type: 'Group',
        metadata: {
          ga: {
            value: 'FAN'
          }
        }
      })
    ).toBe(false);
    expect(
      Device.matchesDeviceType({
        type: 'Group',
        metadata: {
          ga: {
            value: 'FAN'
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
    expect(Device.matchesItemType({ type: 'Dimmer' })).toBe(true);
    expect(Device.matchesItemType({ type: 'String' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Dimmer' })).toBe(true);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'String' })).toBe(false);
  });

  describe('getTraits', () => {
    test('getTraits Dimmer', () => {
      const item = {
        type: 'Dimmer'
      };
      expect(Device.getTraits(item)).toStrictEqual(['action.devices.traits.OnOff', 'action.devices.traits.FanSpeed']);
    });

    test('getTraits Group Dimmer', () => {
      const item = {
        type: 'Group',
        groupType: 'Dimmer'
      };
      expect(Device.getTraits(item)).toStrictEqual(['action.devices.traits.OnOff', 'action.devices.traits.FanSpeed']);
    });

    test('getTraits only fanPower', () => {
      const item = {
        type: 'Group',
        members: [
          {
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
      expect(Device.getTraits(item)).toStrictEqual(['action.devices.traits.OnOff']);
    });

    test('getTraits all members', () => {
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
        'action.devices.traits.SensorState'
      ]);
    });
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
      expect(Device.getAttributes(item)).toStrictEqual({ supportsFanSpeedPercent: true });
    });

    test('getAttributes fanSpeeds', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              ordered: true,
              fanSpeeds: '0=null:off,50=slow,100=full:fast',
              lang: 'en'
            }
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
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
        reversible: false
      });
    });

    test('getAttributes fanMode', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              fanModeName: 'OperationMode,Modus',
              fanModeSettings: '1=Silent,2=Normal,3=Night'
            }
          }
        },
        members: [
          {
            name: 'FanMode',
            type: 'String',
            metadata: {
              ga: {
                value: 'fanMode'
              }
            }
          }
        ]
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        supportsFanSpeedPercent: true,
        availableModes: [
          {
            name: 'OperationMode',
            name_values: [
              {
                lang: 'en',
                name_synonym: ['OperationMode', 'Modus']
              }
            ],
            ordered: false,
            settings: [
              {
                setting_name: '1',
                setting_values: [
                  {
                    lang: 'en',
                    setting_synonym: ['1', 'Silent']
                  }
                ]
              },
              {
                setting_name: '2',
                setting_values: [
                  {
                    lang: 'en',
                    setting_synonym: ['2', 'Normal']
                  }
                ]
              },
              {
                setting_name: '3',
                setting_values: [
                  {
                    lang: 'en',
                    setting_synonym: ['3', 'Night']
                  }
                ]
              }
            ]
          }
        ]
      });
    });

    test('getAttributes fanFilterLifeTime', () => {
      const item = {
        members: [
          {
            name: 'FanFilterLifeTime',
            type: 'Number',
            metadata: {
              ga: {
                value: 'fanFilterLifeTime'
              }
            }
          }
        ]
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        supportsFanSpeedPercent: true,
        sensorStatesSupported: [
          {
            descriptiveCapabilities: {
              availableStates: ['new', 'good', 'replace soon', 'replace now']
            },
            numericCapabilities: {
              rawValueUnit: 'PERCENTAGE'
            },
            name: 'FilterLifeTime'
          }
        ]
      });
    });

    test('getAttributes fanPM25', () => {
      const item = {
        members: [
          {
            name: 'FanPM25',
            type: 'Number',
            metadata: {
              ga: {
                value: 'fanPM25'
              }
            }
          }
        ]
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        supportsFanSpeedPercent: true,
        sensorStatesSupported: [
          {
            numericCapabilities: {
              rawValueUnit: 'MICROGRAMS_PER_CUBIC_METER'
            },
            name: 'PM2.5'
          }
        ]
      });
    });
  });

  describe('getState', () => {
    test('getState Dimmer', () => {
      expect(Device.getState({ type: 'Dimmer', state: '50' })).toStrictEqual({
        currentFanSpeedSetting: '50',
        on: true
      });
    });

    test('getState Group fanPower', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'FAN'
          }
        },
        members: [
          {
            name: 'FanPower',
            type: 'Switch',
            metadata: {
              ga: {
                value: 'fanPower'
              }
            },
            state: 'ON'
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        on: true
      });
    });

    test('getState Group fanSpeed', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'FAN'
          }
        },
        members: [
          {
            name: 'FanSpeed',
            type: 'Dimmer',
            metadata: {
              ga: {
                value: 'fanSpeed'
              }
            },
            state: '50'
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        currentFanSpeedSetting: '50',
        on: true
      });
    });

    test('getState Group fanMode', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'FAN',
            config: {
              fanModeName: 'OperationMode,Modus',
              fanModeSettings: '1=Silent,2=Normal,3=Night'
            }
          }
        },
        members: [
          {
            name: 'FanMode',
            type: 'Number',
            metadata: {
              ga: {
                value: 'fanMode'
              }
            },
            state: '2'
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        currentModeSettings: {
          OperationMode: '2'
        }
      });
    });

    test('getState Group fanFilterLifeTime', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'FAN'
          }
        },
        members: [
          {
            name: 'FanFilterLifeTime',
            type: 'Number',
            metadata: {
              ga: {
                value: 'fanFilterLifeTime'
              }
            },
            state: '70'
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        currentSensorStateData: [
          {
            name: 'FilterLifeTime',
            currentSensorState: 'good',
            rawValue: 70
          }
        ]
      });
    });

    test('getState Group fanPM25', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'FAN'
          }
        },
        members: [
          {
            name: 'FanPM25',
            type: 'Number',
            metadata: {
              ga: {
                value: 'fanPM25'
              }
            },
            state: '20'
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        currentSensorStateData: [
          {
            name: 'PM2.5',
            rawValue: 20
          }
        ]
      });
    });
  });
});

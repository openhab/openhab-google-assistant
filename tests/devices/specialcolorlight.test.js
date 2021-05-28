const Device = require('../../functions/devices/specialcolorlight.js');

describe('SpecialColorLight Device', () => {
  test('matchesDeviceType', () => {
    const item = {
      metadata: {
        ga: {
          value: 'LIGHT',
          config: {
            colorTemperatureRange: '1000,4000'
          }
        }
      },
      members: [
        {
          metadata: {
            ga: {
              value: 'lightBrightness'
            }
          }
        },
        {
          metadata: {
            ga: {
              value: 'lightColorTemperature'
            }
          }
        }
      ]
    };
    const item2 = {
      metadata: {
        ga: {
          value: 'LIGHT'
        }
      },
      members: [
        {
          metadata: {
            ga: {
              value: 'lightBrightness'
            }
          }
        },
        {
          metadata: {
            ga: {
              value: 'lightColorTemperature'
            }
          }
        }
      ]
    };
    const item3 = {
      metadata: {
        ga: {
          value: 'LIGHT',
          config: {
            useKelvin: true
          }
        }
      },
      members: [
        {
          metadata: {
            ga: {
              value: 'lightBrightness'
            }
          }
        },
        {
          metadata: {
            ga: {
              value: 'lightColorTemperature'
            }
          }
        }
      ]
    };
    expect(Device.matchesDeviceType(item)).toBe(true);
    expect(Device.matchesDeviceType(item2)).toBe(false);
    expect(Device.matchesDeviceType(item3)).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ type: 'Group' })).toBe(true);
    expect(Device.matchesItemType({ type: 'Color' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Color' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Dimmer' })).toBe(false);
  });

  describe('getAttributes', () => {
    test('getAttributes colorTemperatureRange', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              colorTemperatureRange: '1000,2000'
            }
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        colorTemperatureRange: {
          temperatureMinK: 1000,
          temperatureMaxK: 2000
        }
      });
    });

    test('getAttributes invalid colorTemperatureRange', () => {
      const item1 = {
        metadata: {
          ga: {
            config: {
              colorTemperatureRange: 'a,b'
            }
          }
        }
      };
      expect(Device.getAttributes(item1)).toStrictEqual({});
    });
  });

  test('getMetadata', () => {
    const item = {
      name: 'LightItem',
      type: 'Group',
      metadata: {
        ga: {
          config: {
            colorTemperatureRange: '1000,2000',
            useKelvin: true
          }
        }
      }
    };
    expect(Device.getMetadata(item).customData).toStrictEqual({
      colorTemperatureRange: {
        temperatureMaxK: 2000,
        temperatureMinK: 1000
      },
      deviceType: 'SpecialColorLight',
      itemType: 'Group',
      members: {},
      useKelvin: true
    });
  });

  describe('getState', () => {
    test('getState', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {
              colorTemperatureRange: '1000,4000'
            }
          }
        },
        members: [
          {
            state: '50',
            metadata: {
              ga: {
                value: 'lightBrightness'
              }
            }
          },
          {
            state: '20',
            metadata: {
              ga: {
                value: 'lightColorTemperature'
              }
            }
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        on: true,
        brightness: 50,
        color: {
          temperatureK: 3400
        }
      });
    });
    test('getState use kelvin', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {
              colorTemperatureRange: '1000,4000',
              useKelvin: true
            }
          }
        },
        members: [
          {
            state: '50',
            metadata: {
              ga: {
                value: 'lightBrightness'
              }
            }
          },
          {
            state: '2000',
            metadata: {
              ga: {
                value: 'lightColorTemperature'
              }
            }
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        on: true,
        brightness: 50,
        color: {
          temperatureK: 2000
        }
      });
    });
  });
});

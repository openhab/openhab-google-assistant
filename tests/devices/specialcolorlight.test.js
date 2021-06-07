const Device = require('../../functions/devices/specialcolorlight.js');

describe('SpecialColorLight Device', () => {
  test('isCompatible', () => {
    expect(
      Device.isCompatible({
        metadata: {
          ga: {
            value: 'LIGHT'
          }
        }
      })
    ).toBe(true);
  });

  test('matchesItemType', () => {
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
      type: 'Group',
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
      type: 'Group',
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
    expect(Device.matchesItemType(item)).toBe(true);
    expect(Device.matchesItemType(item2)).toBe(false);
    expect(Device.matchesItemType(item3)).toBe(true);
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

    test('getState zero brightness', () => {
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
            state: '0',
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
        on: false,
        brightness: 0,
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

    test('getState lightPower', () => {
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
            state: 'OFF',
            metadata: {
              ga: {
                value: 'lightPower'
              }
            }
          },
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
        on: false,
        brightness: 50,
        color: {
          temperatureK: 3400
        }
      });
    });
  });
});

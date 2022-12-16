const Device = require('../../functions/devices/specialcolorlight.js');

describe('SpecialColorLight Device', () => {
  test('isCompatible', () => {
    expect(
      Device.isCompatible({
        metadata: {
          ga: {
            value: 'SpecialColorLight'
          }
        }
      })
    ).toBe(true);
  });

  test('matchesItemType', () => {
    const item1 = {
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
            colorUnit: 'kelvin'
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
    const item4 = {
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
              value: 'lightColor'
            }
          }
        }
      ]
    };
    const item5 = {
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
              value: 'lightPower'
            }
          }
        }
      ]
    };
    const item6 = {
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
    const item7 = {
      type: 'Group',
      metadata: {
        ga: {
          value: 'LIGHT',
          config: {
            colorUnit: 'mired'
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
    expect(Device.matchesItemType(item1)).toBe(true);
    expect(Device.matchesItemType(item2)).toBe(false);
    expect(Device.matchesItemType(item3)).toBe(true);
    expect(Device.matchesItemType(item4)).toBe(true);
    expect(Device.matchesItemType(item5)).toBe(true);
    expect(Device.matchesItemType(item6)).toBe(false);
    expect(Device.matchesItemType(item7)).toBe(true);
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

    test('getAttributes colorTemperatureRange with mired', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              colorUnit: 'mired',
              colorTemperatureRange: '250,454'
            }
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        colorTemperatureRange: {
          temperatureMinK: 2203,
          temperatureMaxK: 4000
        }
      });
    });

    test('getAttributes color', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              colorTemperatureRange: '1000,2000'
            }
          }
        },
        members: [
          {
            metadata: {
              ga: {
                value: 'lightColor'
              }
            }
          }
        ]
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        colorModel: 'hsv',
        colorTemperatureRange: {
          temperatureMinK: 1000,
          temperatureMaxK: 2000
        }
      });
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
            state: '50.421',
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

    test('getState kelvin', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {
              colorUnit: 'kelvin'
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
            state: '2000.345',
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

    test('getState mired', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {
              colorUnit: 'mired'
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
            state: '200',
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
          temperatureK: 5000
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

    test('getState color', () => {
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
            state: '100,50,10',
            metadata: {
              ga: {
                value: 'lightColor'
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
          spectrumHSV: {
            hue: 100,
            saturation: 0.5,
            value: 0.1
          }
        }
      });
    });

    test('getState color off', () => {
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
            state: '100,50,0',
            metadata: {
              ga: {
                value: 'lightColor'
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
  });
});

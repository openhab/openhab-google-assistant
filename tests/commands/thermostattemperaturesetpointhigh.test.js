const Command = require('../../functions/commands/thermostattemperaturesetpointhigh.js');

describe('ThermostatTemperatureSetpointHigh Command', () => {
  const params = { thermostatTemperatureSetpointHigh: 20 };

  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams(params)).toBe(true);
  });

  test('requiresItem', () => {
    expect(Command.requiresItem()).toBe(true);
  });

  test('getItemName', () => {
    expect(() => {
      Command.getItemName({ id: 'Item' });
    }).toThrow();
    const device = {
      customData: {
        members: {
          thermostatTemperatureSetpointHigh: 'SetpointItem'
        }
      }
    };
    expect(Command.getItemName(device)).toBe('SetpointItem');
  });

  test('convertParamsToValue', () => {
    const item = {
      metadata: {
        ga: {
          config: {
            useFahrenheit: true
          }
        }
      }
    };
    expect(Command.convertParamsToValue(params, item)).toBe('68');
    expect(Command.convertParamsToValue(params, {})).toBe('20');
  });

  test('getResponseStates', () => {
    const item = {
      members: [
        {
          metadata: {
            ga: {
              value: 'thermostatTemperatureSetpointHigh'
            }
          }
        }
      ]
    };
    expect(Command.getResponseStates(params, item)).toStrictEqual({ thermostatTemperatureSetpointHigh: 20 });
  });

  test('getResponseStates throws lockedToRange when high <= low', () => {
    const item = {
      members: [
        {
          name: 'SetpointLow',
          type: 'Number',
          state: '18.0',
          metadata: {
            ga: {
              value: 'thermostatTemperatureSetpointLow'
            }
          }
        },
        {
          name: 'SetpointHigh',
          type: 'Number',
          state: '22.0',
          metadata: {
            ga: {
              value: 'thermostatTemperatureSetpointHigh'
            }
          }
        }
      ],
      metadata: {
        ga: {
          config: {}
        }
      }
    };
    expect(() => {
      Command.getResponseStates({ thermostatTemperatureSetpointHigh: 18 }, item);
    }).toThrow('High setpoint must be above the current low setpoint');
  });

  test('getResponseStates throws rangeTooClose when gap < 0.5', () => {
    const item = {
      members: [
        {
          name: 'SetpointLow',
          type: 'Number',
          state: '19.0',
          metadata: {
            ga: {
              value: 'thermostatTemperatureSetpointLow'
            }
          }
        },
        {
          name: 'SetpointHigh',
          type: 'Number',
          state: '22.0',
          metadata: {
            ga: {
              value: 'thermostatTemperatureSetpointHigh'
            }
          }
        }
      ],
      metadata: {
        ga: {
          config: {}
        }
      }
    };
    expect(() => {
      Command.getResponseStates({ thermostatTemperatureSetpointHigh: 19.3 }, item);
    }).toThrow('Setpoint range is too close to adjust');
  });

  test('getResponseStates throws valueOutOfRange when below min', () => {
    const item = {
      members: [],
      metadata: {
        ga: {
          config: {
            thermostatTemperatureRange: '10, 30'
          }
        }
      }
    };
    expect(() => {
      Command.getResponseStates({ thermostatTemperatureSetpointHigh: 8 }, item);
    }).toThrow('Temperature below minimum allowed');
  });

  test('getResponseStates throws valueOutOfRange when above max', () => {
    const item = {
      members: [],
      metadata: {
        ga: {
          config: {
            thermostatTemperatureRange: '10, 30'
          }
        }
      }
    };
    expect(() => {
      Command.getResponseStates({ thermostatTemperatureSetpointHigh: 35 }, item);
    }).toThrow('Temperature above maximum allowed');
  });

  test('getResponseStates succeeds with valid range and no low setpoint', () => {
    const item = {
      members: [
        {
          name: 'SetpointHigh',
          state: '22.0',
          metadata: {
            ga: {
              value: 'thermostatTemperatureSetpointHigh'
            }
          }
        }
      ],
      metadata: {
        ga: {
          config: {
            thermostatTemperatureRange: '10, 30'
          }
        }
      }
    };
    expect(Command.getResponseStates({ thermostatTemperatureSetpointHigh: 25 }, item)).toStrictEqual({
      thermostatTemperatureSetpointHigh: 25
    });
  });
});

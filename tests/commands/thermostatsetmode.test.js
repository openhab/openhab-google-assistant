const Command = require('../../functions/commands/thermostatsetmode.js');

describe('ThermostatSetMode Command', () => {
  const params = { thermostatMode: 'eco' };

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
          thermostatMode: 'ModeItem'
        }
      }
    };
    expect(Command.getItemName(device)).toBe('ModeItem');
  });

  test('convertParamsToValue', () => {
    const item = {
      metadata: {
        ga: {
          config: {
            thermostatModes: 'eco=ECO'
          }
        }
      }
    };
    expect(Command.convertParamsToValue(params, item)).toBe('ECO');
  });

  test('getResponseStates', () => {
    const item = {
      members: [
        {
          metadata: {
            ga: {
              value: 'thermostatMode'
            }
          }
        }
      ]
    };
    expect(Command.getResponseStates(params, item)).toStrictEqual({ thermostatMode: 'eco' });
  });

  describe('checkCurrentState', () => {
    test('throws IN_AUTO_MODE when already in auto mode', () => {
      expect(() => {
        Command.checkCurrentState('AUTO', 'AUTO', { thermostatMode: 'auto' });
      }).toThrow('Thermostat is already in auto mode');
    });

    test('throws IN_OFF_MODE when already in off mode', () => {
      expect(() => {
        Command.checkCurrentState('OFF', 'OFF', { thermostatMode: 'off' });
      }).toThrow('Thermostat is already in off mode');
    });

    test('throws IN_ECO_MODE when already in eco mode', () => {
      expect(() => {
        Command.checkCurrentState('ECO', 'ECO', { thermostatMode: 'eco' });
      }).toThrow('Thermostat is already in eco mode');
    });

    test('throws IN_DRY_MODE when already in dry mode', () => {
      expect(() => {
        Command.checkCurrentState('DRY', 'DRY', { thermostatMode: 'dry' });
      }).toThrow('Thermostat is already in dry mode');
    });

    test('throws IN_FAN_ONLY_MODE when already in fan-only mode', () => {
      expect(() => {
        Command.checkCurrentState('FAN', 'FAN', { thermostatMode: 'fan-only' });
      }).toThrow('Thermostat is already in fan-only mode');
    });

    test('throws IN_PURIFIER_MODE when already in purifier mode', () => {
      expect(() => {
        Command.checkCurrentState('PURIFIER', 'PURIFIER', { thermostatMode: 'purifier' });
      }).toThrow('Thermostat is already in purifier mode');
    });

    test('throws IN_HEAT_OR_COOL when already in heat mode', () => {
      expect(() => {
        Command.checkCurrentState('HEAT', 'HEAT', { thermostatMode: 'heat' });
      }).toThrow('Thermostat is already in heat mode');
    });

    test('throws IN_HEAT_OR_COOL when already in cool mode', () => {
      expect(() => {
        Command.checkCurrentState('COOL', 'COOL', { thermostatMode: 'cool' });
      }).toThrow('Thermostat is already in cool mode');
    });

    test('throws IN_HEAT_OR_COOL when already in heatcool mode', () => {
      expect(() => {
        Command.checkCurrentState('HEATCOOL', 'HEATCOOL', { thermostatMode: 'heatcool' });
      }).toThrow('Thermostat is already in heatcool mode');
    });

    test('throws ALREADY_IN_STATE for unknown mode', () => {
      expect(() => {
        Command.checkCurrentState('CUSTOM', 'CUSTOM', { thermostatMode: 'custom' });
      }).toThrow('Thermostat is already in custom mode');
    });

    test('does not throw when modes are different', () => {
      expect(() => {
        Command.checkCurrentState('HEAT', 'COOL', { thermostatMode: 'heat' });
      }).not.toThrow();
    });
  });
});

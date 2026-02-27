const Command = require('../../functions/commands/thermostattemperaturesetpoint.js');

describe('ThermostatTemperatureSetpoint Command', () => {
  const params = { thermostatTemperatureSetpoint: 20 };

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
          thermostatTemperatureSetpoint: 'SetpointItem'
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
              value: 'thermostatTemperatureSetpoint'
            }
          }
        }
      ]
    };
    expect(Command.getResponseStates(params, item)).toStrictEqual({ thermostatTemperatureSetpoint: 20 });
  });

  describe('checkCurrentState', () => {
    test('throws TARGET_ALREADY_REACHED when within tolerance', () => {
      expect(() => {
        Command.checkCurrentState('20', '20.3', params);
      }).toThrow('Already at target temperature 20°C');
    });

    test('throws TARGET_ALREADY_REACHED when exactly at target', () => {
      expect(() => {
        Command.checkCurrentState('20', '20', params);
      }).toThrow('Already at target temperature 20°C');
    });

    test('does not throw when outside tolerance', () => {
      expect(() => {
        Command.checkCurrentState('20', '22', params);
      }).not.toThrow();
    });

    test('does not throw when difference is at boundary', () => {
      expect(() => {
        Command.checkCurrentState('20', '20.5', params);
      }).not.toThrow();
    });

    test('does not throw for invalid numeric values', () => {
      expect(() => {
        Command.checkCurrentState('invalid', 'NaN', params);
      }).not.toThrow();
    });
  });
});

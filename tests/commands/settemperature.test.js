const Command = require('../../functions/commands/settemperature.js');

describe('SetTemperature Command', () => {
  const params = { temperature: 180 };

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
          ovenTemperatureTarget: 'TargetItem'
        }
      }
    };
    expect(Command.getItemName(device)).toBe('TargetItem');
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
    expect(Command.convertParamsToValue(params, item)).toBe('356');
    expect(Command.convertParamsToValue(params, {})).toBe('180');
  });

  test('getResponseStates', () => {
    const item = {
      members: [
        {
          metadata: {
            ga: {
              value: 'ovenTemperatureTarget'
            }
          }
        }
      ]
    };
    expect(Command.getResponseStates(params, item)).toStrictEqual({ temperatureSetpointCelsius: 180 });
  });

  describe('checkCurrentState', () => {
    test('throws TARGET_ALREADY_REACHED when within tolerance', () => {
      expect(() => {
        Command.checkCurrentState('180', '180.3', params, {});
      }).toThrow('Already at target temperature 180°C');
    });

    test('does not throw when outside tolerance', () => {
      expect(() => {
        Command.checkCurrentState('180', '190', params, {});
      }).not.toThrow();
    });

    test('does not throw for invalid numeric values', () => {
      expect(() => {
        Command.checkCurrentState('invalid', 'NaN', params, {});
      }).not.toThrow();
    });

    test('uses 0.9°F tolerance for Fahrenheit-configured items', () => {
      const fahrenheitItem = {
        metadata: {
          ga: {
            config: {
              useFahrenheit: true
            }
          }
        }
      };
      expect(() => {
        Command.checkCurrentState('356', '356.8', params, fahrenheitItem);
      }).toThrow('Already at target temperature 180°C');
      expect(() => {
        Command.checkCurrentState('356', '358', params, fahrenheitItem);
      }).not.toThrow();
    });
  });
});

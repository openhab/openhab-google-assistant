const Command = require('../../functions/commands/colorabsolutetemperature.js');

describe('ColorAbsoluteTemperature Command', () => {
  const params = {
    color: {
      temperature: 2000
    }
  };

  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ color: {} })).toBe(false);
    expect(Command.validateParams(params)).toBe(true);
  });

  test('requiresItem', () => {
    expect(Command.requiresItem()).toBe(true);
  });

  test('getItemName', () => {
    expect(Command.getItemName({ name: 'Item' }, {})).toBe('Item');
    expect(() => {
      Command.getItemName({ name: 'Item' }, { customData: { deviceType: 'SpecialColorLight' } });
    }).toThrow();
    const item = {
      name: 'Item',
      members: [
        {
          name: 'ColorTemperatureItem',
          metadata: {
            ga: {
              value: 'lightColorTemperature'
            }
          }
        }
      ]
    };
    expect(Command.getItemName(item, { customData: { deviceType: 'SpecialColorLight' } })).toBe('ColorTemperatureItem');
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(Command.convertParamsToValue(params, { state: '100,100,50' }, {})).toBe('30.62,95,50');
    });

    test('convertParamsToValue SpecialColorLight', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              colorTemperatureRange: '1000,5000'
            }
          }
        }
      };
      const device = { customData: { deviceType: 'SpecialColorLight' } };
      expect(Command.convertParamsToValue(params, item, device)).toBe('75');
      expect(Command.convertParamsToValue(params, { state: '100,100,50' }, device)).toBe('0');
    });

    test('convertParamsToValue SpecialColorLight Kelvin', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              colorUnit: 'kelvin'
            }
          }
        }
      };
      const device = { customData: { deviceType: 'SpecialColorLight' } };
      expect(Command.convertParamsToValue(params, item, device)).toBe('2000');
    });

    test('convertParamsToValue SpecialColorLight Mired', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              colorUnit: 'mired'
            }
          }
        }
      };
      const device = { customData: { deviceType: 'SpecialColorLight' } };
      expect(Command.convertParamsToValue(params, item, device)).toBe('500');
    });
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates(params)).toStrictEqual({
      color: {
        temperatureK: 2000
      }
    });
  });
});

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
    expect(Command.requiresItem({})).toBe(true);
    expect(Command.requiresItem({ customData: { deviceType: 'SpecialColorLight' } })).toBe(false);
  });

  test('getItemName', () => {
    expect(Command.getItemName({ id: 'Item' })).toBe('Item');
    expect(Command.getItemName({ id: 'Item', customData: {} })).toBe('Item');
    expect(() => {
      Command.getItemName({ id: 'Item', customData: { deviceType: 'SpecialColorLight' } });
    }).toThrow();
    expect(
      Command.getItemName({
        id: 'Item',
        customData: {
          deviceType: 'SpecialColorLight',
          members: {
            lightColorTemperature: 'ColorItem'
          }
        }
      })
    ).toBe('ColorItem');
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(Command.convertParamsToValue(params, { state: '100,100,50' }, {})).toBe('30.62,95,50');
    });

    test('convertParamsToValue SpecialColorLight Percent', () => {
      const device = {
        customData: {
          deviceType: 'SpecialColorLight',
          colorUnit: 'percent',
          colorTemperatureRange: { temperatureMinK: 1000, temperatureMaxK: 5000 }
        }
      };
      expect(Command.convertParamsToValue(params, {}, device)).toBe('25');
    });

    test('convertParamsToValue SpecialColorLight Percent Inverted', () => {
      const device = {
        customData: {
          deviceType: 'SpecialColorLight',
          colorUnit: 'percent',
          colorTemperatureRange: { temperatureMinK: 1000, temperatureMaxK: 5000 },
          colorTemperatureInverted: true
        }
      };
      expect(Command.convertParamsToValue(params, {}, device)).toBe('75');
    });

    test('convertParamsToValue SpecialColorLight Invalid', () => {
      const device = {
        customData: {
          deviceType: 'SpecialColorLight'
        }
      };
      expect(Command.convertParamsToValue(params, { state: '100,100,50' }, device)).toBe('0');
    });

    test('convertParamsToValue SpecialColorLight Kelvin', () => {
      const device = { customData: { deviceType: 'SpecialColorLight', colorUnit: 'kelvin' } };
      expect(Command.convertParamsToValue(params, {}, device)).toBe('2000');
    });

    test('convertParamsToValue SpecialColorLight Mired', () => {
      const device = { customData: { deviceType: 'SpecialColorLight', colorUnit: 'mired' } };
      expect(Command.convertParamsToValue(params, {}, device)).toBe('500');
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

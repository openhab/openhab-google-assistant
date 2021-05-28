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

    test('convertParamsToValue SpecialColorLight', () => {
      expect(
        Command.convertParamsToValue(
          params,
          {},
          {
            customData: {
              deviceType: 'SpecialColorLight',
              colorTemperatureRange: { temperatureMinK: 1000, temperatureMaxK: 5000 }
            }
          }
        )
      ).toBe('75');
      expect(
        Command.convertParamsToValue(
          params,
          { state: '100,100,50' },
          {
            customData: {
              deviceType: 'SpecialColorLight'
            }
          }
        )
      ).toBe('0');
    });

    test('convertParamsToValue SpecialColorLight Kelvin', () => {
      expect(
        Command.convertParamsToValue(
          params,
          {},
          {
            customData: { deviceType: 'SpecialColorLight', useKelvin: true }
          }
        )
      ).toBe('2000');
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

const Command = require('../../functions/commands/colorabsolute.js');

describe('ColorAbsolute Command', () => {
  const params = {
    color: {
      spectrumHSV: { hue: 10, saturation: 0.2, value: 0.3 }
    }
  };

  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ color: {} })).toBe(false);
    expect(Command.validateParams(params)).toBe(true);
  });

  test('getItemName', () => {
    expect(Command.getItemName({ name: 'Item' }, {})).toBe('Item');
    expect(Command.getItemName({ name: 'Item' }, { customData: {} })).toBe('Item');
    expect(Command.getItemName({ name: 'Item' }, { customData: { deviceType: 'ColorLight' } })).toBe('Item');
    expect(() => {
      Command.getItemName({ name: 'Item' }, { customData: { deviceType: 'SpecialColorLight' } });
    }).toThrow();
    const item = {
      name: 'Item',
      members: [
        {
          name: 'ColorItem',
          metadata: {
            ga: {
              value: 'lightColor'
            }
          }
        }
      ]
    };
    expect(Command.getItemName(item, { customData: { deviceType: 'SpecialColorLight' } })).toBe('ColorItem');
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue(params, {}, { customData: { deviceType: 'ColorLight' } })).toBe('10,20,30');
    expect(Command.convertParamsToValue(params, {}, { customData: { deviceType: 'SpecialColorLight' } })).toBe(
      '10,20,30'
    );
    expect(() => Command.convertParamsToValue(params, {}, { customData: { deviceType: 'Light' } })).toThrow();
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates(params)).toStrictEqual({
      color: {
        spectrumHsv: { hue: 10, saturation: 0.2, value: 0.3 }
      }
    });
  });
});

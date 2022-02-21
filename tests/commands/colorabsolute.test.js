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

  test('requiresItem', () => {
    expect(Command.requiresItem({})).toBe(false);
    expect(Command.requiresItem({ customData: { deviceType: 'SpecialColorLight' } })).toBe(true);
  });

  test('getItemName', () => {
    expect(Command.getItemNameAndState({ name: 'Item' }, {})).toStrictEqual({ name: 'Item', state: undefined });
    expect(Command.getItemNameAndState({ name: 'Item' }, { customData: { deviceType: 'ColorLight' } })).toStrictEqual({
      name: 'Item',
      state: undefined
    });
    expect(() => {
      Command.getItemNameAndState({ name: 'Item' }, { customData: { deviceType: 'SpecialColorLight' } });
    }).toThrow();
    const item = {
      name: 'Item',
      members: [
        {
          name: 'ColorItem',
          state: '50,50,50',
          metadata: {
            ga: {
              value: 'lightColor'
            }
          }
        }
      ]
    };
    expect(Command.getItemNameAndState(item, { customData: { deviceType: 'SpecialColorLight' } })).toStrictEqual({
      name: 'ColorItem',
      state: '50,50,50'
    });
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

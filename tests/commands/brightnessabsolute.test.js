const Command = require('../../functions/commands/brightnessabsolute.js');

describe('BrightnessAbsolute Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ brightness: 100 })).toBe(true);
    expect(Command.validateParams({ brightness: '100' })).toBe(false);
  });

  test('requiresItem', () => {
    expect(Command.requiresItem({})).toBe(false);
    expect(Command.requiresItem({ customData: {} })).toBe(false);
    expect(Command.requiresItem({ customData: { deviceType: 'SpecialColorLight' } })).toBe(true);
  });

  test('getItemName', () => {
    expect(Command.getItemNameAndState({ name: 'Item' }, {})).toStrictEqual({ name: 'Item', state: undefined });
    expect(() => {
      Command.getItemNameAndState({ name: 'Item' }, { customData: { deviceType: 'SpecialColorLight' } });
    }).toThrow();
    const item = {
      name: 'Item',
      members: [
        {
          name: 'BrightnessItem',
          state: '80',
          metadata: {
            ga: {
              value: 'lightBrightness'
            }
          }
        }
      ]
    };
    expect(Command.getItemNameAndState(item, { customData: { deviceType: 'SpecialColorLight' } })).toStrictEqual({
      name: 'BrightnessItem',
      state: '80'
    });
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue({ brightness: 0 })).toBe('0');
    expect(Command.convertParamsToValue({ brightness: 100 })).toBe('100');
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates({ brightness: 0 })).toStrictEqual({ brightness: 0 });
    expect(Command.getResponseStates({ brightness: 100 })).toStrictEqual({ brightness: 100 });
  });
});

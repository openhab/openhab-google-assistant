const Command = require('../../functions/commands/setinput.js');

describe('SetInput Command', () => {
  const params = { newInput: 'hdmi1' };

  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams(params)).toBe(true);
  });

  test('requiresItem', () => {
    expect(Command.requiresItem()).toBe(true);
  });

  test('getItemName', () => {
    expect(() => {
      Command.getItemNameAndState({ name: 'Item' });
    }).toThrow();
    const item = {
      members: [
        {
          name: 'InputItem',
          state: 'hdmi1',
          metadata: {
            ga: {
              value: 'tvInput'
            }
          }
        }
      ]
    };
    expect(Command.getItemNameAndState(item)).toStrictEqual({ name: 'InputItem', state: 'hdmi1' });
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue(params)).toBe('hdmi1');
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates(params)).toStrictEqual({ currentInput: 'hdmi1' });
  });
});

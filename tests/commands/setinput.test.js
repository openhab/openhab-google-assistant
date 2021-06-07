const Command = require('../../functions/commands/setinput.js');

describe('SetInput Command', () => {
  const params = { newInput: 'hdmi1' };

  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams(params)).toBe(true);
  });

  test('getItemName', () => {
    expect(() => {
      Command.getItemName({ id: 'Item' });
    }).toThrow();
    const device = {
      customData: {
        members: {
          tvInput: 'InputItem'
        }
      }
    };
    expect(Command.getItemName(device)).toBe('InputItem');
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue(params)).toBe('hdmi1');
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates(params)).toStrictEqual({ currentInput: 'hdmi1' });
  });
});

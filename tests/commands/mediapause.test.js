const Command = require('../../functions/commands/mediapause.js');

describe('mediaPause Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(true);
  });

  test('requiresItem', () => {
    expect(Command.requiresItem()).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName', () => {
      const item = {
        members: [
          {
            name: 'TransportItem',
            state: 'STOPPED',
            metadata: {
              ga: {
                value: 'tvTransport'
              }
            }
          }
        ]
      };
      expect(Command.getItemNameAndState(item)).toStrictEqual({ name: 'TransportItem', state: 'STOPPED' });
    });

    test('getItemName no transport', () => {
      const item = {
        members: []
      };
      expect(() => {
        Command.getItemNameAndState(item);
      }).toThrow();
    });
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue()).toBe('PAUSE');
  });
});

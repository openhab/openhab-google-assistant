const Command = require('../../functions/commands/mediaprevious.js');

describe('mediaPrevious Command', () => {
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
            state: 'PLAYING',
            metadata: {
              ga: {
                value: 'tvTransport'
              }
            }
          }
        ]
      };
      expect(Command.getItemNameAndState(item)).toStrictEqual({ name: 'TransportItem', state: 'PLAYING' });
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
    expect(Command.convertParamsToValue()).toBe('PREVIOUS');
  });
});

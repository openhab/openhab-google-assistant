const Command = require('../../functions/commands/mediaprevious.js');

describe('mediaPrevious Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(true);
  });

  test('getItemName', () => {
    const device = {
      customData: {
        members: {
          tvTransport: 'TransportItem'
        }
      }
    };
    expect(Command.getItemName(device)).toBe('TransportItem');
    expect(() => {
      Command.getItemName({ customData: { members: {} } });
    }).toThrow();
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue()).toBe('PREVIOUS');
  });
});

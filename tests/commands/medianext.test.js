const Command = require('../../functions/commands/medianext.js');

describe('mediaNext Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(true);
  });

  test('requiresItem', () => {
    expect(Command.requiresItem()).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName', () => {
      const item = {
        "members": [
          {
            "name": "TransportItem",
            "metadata": {
              "ga": {
                "value": "tvTransport"
              }
            }
          }
        ]
      };
      expect(Command.getItemName(item)).toBe("TransportItem");
    });

    test('getItemName no transport', () => {
      const item = {
        "members": []
      };
      expect(() => { Command.getItemName(item) }).toThrow();
    });
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue()).toBe("NEXT");
  });
});

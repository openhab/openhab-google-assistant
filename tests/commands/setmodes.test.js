const Command = require('../../functions/commands/setmodes.js');

describe('SetModes Command', () => {
  const params = { "updateModeSettings": { "mode": "value" } };

  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams(params)).toBe(true);
  });

  test('requiresItem', () => {
    expect(Command.requiresItem({})).toBe(false);
    expect(Command.requiresItem({ "customData": { "deviceType": "DynamicModesLight" } })).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName', () => {
      expect(Command.getItemName({ "name": "Item" }, {})).toBe("Item");
      expect(Command.getItemName({ "name": "Item" }, { "customData": {} })).toBe("Item");
    });

    test('getItemName DynamicModesLight', () => {
      expect(() => { Command.getItemName({ "name": "Item" }, { "customData": { "deviceType": "DynamicModesLight" } }) }).toThrow();
      const item = {
        "members": [
          {
            "name": "CurrentMode",
            "metadata": {
              "ga": {
                "value": "modesCurrentMode"
              }
            }
          }
        ]
      };
      expect(Command.getItemName(item, { "customData": { "deviceType": "DynamicModesLight" } })).toBe("CurrentMode");
    });
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue(params)).toBe("value");
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates(params)).toStrictEqual({ "currentModeSettings": { "mode": "value" } });
  });
});

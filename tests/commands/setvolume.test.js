const Command = require('../../functions/commands/setvolume.js');

describe('setVolume Command', () => {
  const params = { "volumeLevel": 20 };

  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams(params)).toBe(true);
  });

  test('requiresItem', () => {
    expect(Command.requiresItem({})).toBe(false);
    expect(Command.requiresItem({ "customData": { "deviceType": "TV" } })).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName', () => {
      expect(Command.getItemName({ "name": "Item" }, {})).toBe("Item");
      expect(Command.getItemName({ "name": "Item" }, { "customData": {} })).toBe("Item");
    });

    test('getItemName TV', () => {
      expect(() => { Command.getItemName({ "name": "Item" }, { "customData": { "deviceType": "TV" } }) }).toThrow();
      const item = {
        "members": [
          {
            "name": "VolumeItem",
            "metadata": {
              "ga": {
                "value": "tvVolume"
              }
            }
          }
        ]
      };
      expect(Command.getItemName(item, { "customData": { "deviceType": "TV" } })).toBe("VolumeItem");
    });
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue(params)).toBe("20");
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates(params)).toStrictEqual({ "currentVolume": 20 });
  });
});

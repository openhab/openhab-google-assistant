const Command = require('../../functions/commands/mute.js');

describe('Mute Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ "mute": true })).toBe(true);
  });

  test('requiresItem', () => {
    expect(Command.requiresItem({})).toBe(false);
    expect(Command.requiresItem({ "customData": {} })).toBe(false);
    expect(Command.requiresItem({ "customData": { "deviceType": "TV" } })).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName', () => {
      expect(Command.getItemName({ "name": "Item" }, {})).toBe("Item");
      expect(Command.getItemName({ "name": "Item" }, { "customData": {} })).toBe("Item");
    });

    test('getItemName TV no members', () => {
      expect(() => { Command.getItemName({ "name": "Item" }, { "customData": { "deviceType": "TV" } }) }).toThrow();
    });

    test('getItemName TV mute', () => {
      const item = {
        "name": "Item",
        "members": [
          {
            "name": "MuteItem",
            "metadata": {
              "ga": {
                "value": "tvMute"
              }
            }
          }
        ]
      };
      expect(Command.getItemName(item, { "customData": { "deviceType": "TV" } })).toBe("MuteItem");
    });

    test('getItemName TV volume', () => {
      const item = {
        "name": "Item",
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

  describe('convertParamsToValue', () => {
    test('convertParamsToValue no Switch', () => {
      expect(Command.convertParamsToValue({ "mute": true }, {}, {})).toBe("0");
      expect(Command.convertParamsToValue({ "mute": false }, {}, {})).toBeUndefined();
    });

    test('convertParamsToValue Switch', () => {
      expect(Command.convertParamsToValue({ "mute": true }, {}, { "customData": { "itemType": "Switch" } })).toBe("ON");
      expect(Command.convertParamsToValue({ "mute": false }, {}, { "customData": { "itemType": "Switch" } })).toBe("OFF");
    });

    test('convertParamsToValue inverted', () => {
      expect(Command.convertParamsToValue({ "mute": true }, {}, { "customData": { "itemType": "Switch", "inverted": true } })).toBe("OFF");
      expect(Command.convertParamsToValue({ "mute": false }, {}, { "customData": { "itemType": "Switch", "inverted": true } })).toBe("ON");
    });

    test('convertParamsToValue TV mute', () => {
      const item = {
        "members": [
          {
            "metadata": {
              "ga": {
                "value": "tvMute"
              }
            }
          }
        ]
      };
      expect(Command.convertParamsToValue({ "mute": true }, item, { "customData": { "deviceType": "TV" } })).toBe("ON");
    });

    test('convertParamsToValue TV volume', () => {
      const item = {
        "members": [
          {
            "metadata": {
              "ga": {
                "value": "tvVolume"
              }
            }
          }
        ]
      };
      expect(Command.convertParamsToValue({ "mute": true }, item, { "customData": { "deviceType": "TV" } })).toBe("0");
    });
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates({ "mute": true })).toStrictEqual({ "isMuted": true });
    expect(Command.getResponseStates({ "mute": false })).toStrictEqual({ "isMuted": false });
  });
});

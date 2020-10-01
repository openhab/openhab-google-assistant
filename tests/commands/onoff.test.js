const Command = require('../../functions/commands/onoff.js');

describe('OnOff Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ "on": true })).toBe(true);
  });

  test('requiresItem', () => {
    expect(Command.requiresItem({})).toBe(false);
    expect(Command.requiresItem({ "customData": { "deviceType": "SpecialColorLight" } })).toBe(true);
    expect(Command.requiresItem({ "customData": { "deviceType": "TV" } })).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName', () => {
      expect(Command.getItemName({ "name": "Item" }, {})).toBe("Item");
      expect(Command.getItemName({ "name": "Item" }, { "customData": {} })).toBe("Item");
    });

    test('getItemName SpecialColorLight', () => {
      expect(() => { Command.getItemName({ "name": "Item" }, { "customData": { "deviceType": "SpecialColorLight" } }) }).toThrow();
      const item = {
        "members": [
          {
            "name": "BrightnessItem",
            "metadata": {
              "ga": {
                "value": "lightBrightness"
              }
            }
          }
        ]
      };
      expect(Command.getItemName(item, { "customData": { "deviceType": "SpecialColorLight" } })).toBe("BrightnessItem");
    });

    test('getItemName TV', () => {
      expect(() => { Command.getItemName({ "name": "Item" }, { "customData": { "deviceType": "TV" } }) }).toThrow();
      const item = {
        "members": [
          {
            "name": "PowerItem",
            "metadata": {
              "ga": {
                "value": "tvPower"
              }
            }
          }
        ]
      };
      expect(Command.getItemName(item, { "customData": { "deviceType": "TV" } })).toBe("PowerItem");
    });
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(Command.convertParamsToValue({ "on": true }, {}, {})).toBe("ON");
    });

    test('convertParamsToValue inverted', () => {
      expect(Command.convertParamsToValue({ "on": true }, {}, { "customData": { "inverted": true } })).toBe("OFF");
    });
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates({ "on": true })).toStrictEqual({ "on": true });
    expect(Command.getResponseStates({ "on": false })).toStrictEqual({ "on": false });
  });
});

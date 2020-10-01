const Command = require('../../functions/commands/colorabsolutetemperature.js');

describe('ColorAbsoluteTemperature Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ "color": {} })).toBe(false);
    expect(Command.validateParams({ "color": { "temperature": 1000 } })).toBe(true);
  });

  test('requiresItem', () => {
    expect(Command.requiresItem()).toBe(true);
  });

  test('getItemName', () => {
    expect(Command.getItemName({ "name": "Item" }, {})).toBe("Item");
    expect(Command.getItemName({ "name": "Item" }, { "customData": {} })).toBe("Item");
    expect(() => { Command.getItemName({ "name": "Item" }, { "customData": { "deviceType": "SpecialColorLight" } }) }).toThrow();
    const item = {
      "name": "Item",
      "members": [
        {
          "name": "ColorItem",
          "metadata": {
            "ga": {
              "value": "lightColorTemperature"
            }
          }
        }
      ]
    };
    expect(Command.getItemName(item, { "customData": { "deviceType": "SpecialColorLight" } })).toBe("ColorItem");
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(Command.convertParamsToValue(
        {
          "color": {
            "temperature": 2000
          }
        },
        { "state": "100,100,50" },
        {}
      )).toBe("30.62,95,50");
    });

    test('convertParamsToValue SpecialColorLight', () => {
      const item = {
        "metadata": {
          "ga": {
            "config": {
              "colorTemperatureRange": "1000,5000"
            }
          }
        }
      };
      expect(Command.convertParamsToValue(
        {
          "color": {
            "temperature": 2000
          }
        },
        item,
        { "customData": { "deviceType": "SpecialColorLight" } }
      )).toBe("75");

      expect(Command.convertParamsToValue(
        {
          "color": {
            "temperature": 2000
          }
        },
        { "state": "100,100,50" },
        { "customData": { "deviceType": "SpecialColorLight" } }
      )).toBe("0");
    });

    test('getResponseStates', () => {
      expect(Command.getResponseStates({
        "color": {
          "temperature": 2000
        }
      })).toStrictEqual({
        "color": {
          "temperatureK": 2000
        }
      });
    });
  });
});

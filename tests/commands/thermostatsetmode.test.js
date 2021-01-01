const Command = require('../../functions/commands/thermostatsetmode.js');

describe('ThermostatSetMode Command', () => {
  const params = { "thermostatMode": "eco" };

  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams(params)).toBe(true);
  });

  test('requiresItem', () => {
    expect(Command.requiresItem()).toBe(true);
  });

  test('getItemName', () => {
    expect(() => { Command.getItemName({ "name": "Item" }) }).toThrow();
    const item = {
      "members": [
        {
          "name": "ModeItem",
          "metadata": {
            "ga": {
              "value": "thermostatMode"
            }
          }
        }
      ]
    };
    expect(Command.getItemName(item)).toBe("ModeItem");
  });

  test('convertParamsToValue', () => {
    const item = {
      "metadata": {
        "ga": {
          "config": {
            "modes": "eco=ECO"
          }
        }
      }
    };
    expect(Command.convertParamsToValue(params, item)).toBe("ECO");
  });

  test('getResponseStates', () => {
    const item = {
      "members": [
        {
          "metadata": {
            "ga": {
              "value": "thermostatMode"
            }
          }
        }
      ]
    };
    expect(Command.getResponseStates(params, item)).toStrictEqual({ "thermostatMode": "eco" });
  });
});

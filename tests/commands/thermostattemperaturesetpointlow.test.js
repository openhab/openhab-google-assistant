const Command = require('../../functions/commands/thermostattemperaturesetpointlow.js');

describe('ThermostatTemperatureSetpointLow Command', () => {
  const params = { "thermostatTemperatureSetpointLow": 20 };

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
          "name": "SetpointItem",
          "metadata": {
            "ga": {
              "value": "thermostatTemperatureSetpointLow"
            }
          }
        }
      ]
    };
    expect(Command.getItemName(item)).toBe("SetpointItem");
  });

  test('convertParamsToValue', () => {
    const item = {
      "metadata": {
        "ga": {
          "config": {
            "useFahrenheit": true
          }
        }
      }
    };
    expect(Command.convertParamsToValue(params, item)).toBe("68");
    expect(Command.convertParamsToValue(params, {})).toBe("20");
  });

  test('getResponseStates', () => {
    const item = {
      "members": [
        {
          "metadata": {
            "ga": {
              "value": "thermostatTemperatureSetpointLow"
            }
          }
        }
      ]
    };
    expect(Command.getResponseStates(params, item)).toStrictEqual({ "thermostatTemperatureSetpointLow": 20 });
  });
});

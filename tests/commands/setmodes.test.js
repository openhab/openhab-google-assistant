const Command = require('../../functions/commands/setmodes.js');

describe('SetModes Command', () => {
  const params = { "updateModeSettings": { "mode": "value" } };

  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams(params)).toBe(true);
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue(params)).toBe("value");
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates(params)).toStrictEqual({ "currentModeSettings": { "mode": "value" } });
  });
});

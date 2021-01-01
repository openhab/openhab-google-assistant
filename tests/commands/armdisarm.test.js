const Command = require('../../functions/commands/armdisarm.js');

describe('ArmDisarm Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ "arm": true })).toBe(true);
    expect(Command.validateParams({ "arm": "true" })).toBe(false);
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(Command.convertParamsToValue({ "arm": true }, {}, {})).toBe("ON");
      expect(Command.convertParamsToValue({ "arm": false }, {}, {})).toBe("OFF");
    });

    test('convertParamsToValue inverted', () => {
      expect(Command.convertParamsToValue({ "arm": true }, {}, { "customData": { "inverted": true } })).toBe("OFF");
      expect(Command.convertParamsToValue({ "arm": false }, {}, { "customData": { "inverted": true } })).toBe("ON");
    });
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates({ "arm": true })).toStrictEqual({ "isArmed": true });
    expect(Command.getResponseStates({ "arm": false })).toStrictEqual({ "isArmed": false });
  });
});

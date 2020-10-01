const Command = require('../../functions/commands/lockunlock.js');

describe('LockUnlock Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ "lock": true })).toBe(true);
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(Command.convertParamsToValue({ "lock": true }, {}, {})).toBe("ON");
      expect(Command.convertParamsToValue({ "lock": false }, {}, {})).toBe("OFF");
    });
    test('convertParamsToValue inverted', () => {
      expect(Command.convertParamsToValue({ "lock": true }, {}, { "customData": { "inverted": true } })).toBe("OFF");
      expect(Command.convertParamsToValue({ "lock": false }, {}, { "customData": { "inverted": true } })).toBe("ON");
    });
    test('convertParamsToValue Contact', () => {
      expect(() => { Command.convertParamsToValue({ "lock": true }, {}, { "customData": { "itemType": "Contact" } }) }).toThrow();
    });
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates({ "lock": true })).toStrictEqual({ "isLocked": true });
    expect(Command.getResponseStates({ "lock": false })).toStrictEqual({ "isLocked": false });
  });
});

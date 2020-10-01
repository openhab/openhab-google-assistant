const Command = require('../../functions/commands/startstop.js');

describe('StartStop Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ "start": true })).toBe(true);
    expect(Command.validateParams({ "start": "1" })).toBe(false);
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(Command.convertParamsToValue({ "start": true }, {}, {})).toBe("ON");
      expect(Command.convertParamsToValue({ "start": false }, {}, {})).toBe("OFF");
    });

    test('convertParamsToValue Rollershutter', () => {
      const device = { "customData": { "itemType": "Rollershutter" } };
      expect(Command.convertParamsToValue({ "start": true }, {}, device)).toBe("MOVE");
      expect(Command.convertParamsToValue({ "start": false }, {}, device)).toBe("STOP");
    });

    test('convertParamsToValue Contact', () => {
      const device = { "customData": { "itemType": "Contact" } };
      expect(() => { Command.convertParamsToValue({}, {}, device) }).toThrow();
    });
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates({ "start": true })).toStrictEqual({ "isRunning": true, "isPaused": false });
    expect(Command.getResponseStates({ "start": false })).toStrictEqual({ "isRunning": false, "isPaused": true });
  });
});

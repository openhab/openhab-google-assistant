const Command = require('../../functions/commands/openclose.js');

describe('OpenClose Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ "openPercent": 100 })).toBe(true);
    expect(Command.validateParams({ "openPercent": "5" })).toBe(false);
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(Command.convertParamsToValue({ "openPercent": 0 }, {}, {})).toBe("0");
      expect(Command.convertParamsToValue({ "openPercent": 20 }, {}, {})).toBe("20");
      expect(Command.convertParamsToValue({ "openPercent": 50 }, {}, {})).toBe("50");
      expect(Command.convertParamsToValue({ "openPercent": 70 }, {}, {})).toBe("70");
      expect(Command.convertParamsToValue({ "openPercent": 100 }, {}, {})).toBe("100");
    });

    test('convertParamsToValue inverted', () => {
      const device = { "customData": { "inverted": true } };
      expect(Command.convertParamsToValue({ "openPercent": 0 }, {}, device)).toBe("100");
      expect(Command.convertParamsToValue({ "openPercent": 20 }, {}, device)).toBe("80");
      expect(Command.convertParamsToValue({ "openPercent": 50 }, {}, device)).toBe("50");
      expect(Command.convertParamsToValue({ "openPercent": 70 }, {}, device)).toBe("30");
      expect(Command.convertParamsToValue({ "openPercent": 100 }, {}, device)).toBe("0");
    });

    test('convertParamsToValue Rollershutter', () => {
      const device = { "customData": { "itemType": "Rollershutter" } };
      expect(Command.convertParamsToValue({ "openPercent": 0 }, {}, device)).toBe("DOWN");
      expect(Command.convertParamsToValue({ "openPercent": 20 }, {}, device)).toBe("80");
      expect(Command.convertParamsToValue({ "openPercent": 100 }, {}, device)).toBe("UP");
    });

    test('convertParamsToValue Switch', () => {
      const device = { "customData": { "itemType": "Switch" } };
      expect(Command.convertParamsToValue({ "openPercent": 0 }, {}, device)).toBe("OFF");
      expect(Command.convertParamsToValue({ "openPercent": 20 }, {}, device)).toBe("ON");
      expect(Command.convertParamsToValue({ "openPercent": 100 }, {}, device)).toBe("ON");
    });

    test('convertParamsToValue Contact', () => {
      const device = { "customData": { "itemType": "Contact" } };
      expect(() => { Command.convertParamsToValue({}, {}, device) }).toThrow();
    });
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates({ "openPercent": 10 })).toStrictEqual({ "openPercent": 10 });
  });
});

const Command = require('../../functions/commands/colorabsolute.js');

describe('ColorAbsolute Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ "color": {} })).toBe(false);
    expect(Command.validateParams({ "color": { "spectrumHSV": {} } })).toBe(true);
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue({
      "color": {
        "spectrumHSV": { "hue": 10, "saturation": 0.2, "value": 0.3 }
      }
    }, {}, {})).toBe("10,20,30");
    expect(() => (Command.convertParamsToValue({
      "color": {
        "spectrumHSV": { "hue": 10, "saturation": 0.2, "value": 0.3 }
      }
    }, {}, { "customData": { "deviceType": "Light" } }))).toThrow();
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates({
      "color": {
        "spectrumHSV": { "hue": 10, "saturation": 0.2, "value": 0.3 }
      }
    })).toStrictEqual({
      "color": {
        "spectrumHsv": { "hue": 10, "saturation": 0.2, "value": 0.3 }
      }
    });
  });
});

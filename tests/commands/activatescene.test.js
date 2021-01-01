const Command = require('../../functions/commands/activatescene.js');

describe('ActivateScene Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(true);
    expect(Command.validateParams({ "deactivate": true })).toBe(true);
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(Command.convertParamsToValue({ "deactivate": true }, {}, {})).toBe("OFF");
      expect(Command.convertParamsToValue({ "deactivate": false }, {}, {})).toBe("ON");
    });

    test('convertParamsToValue inverted', () => {
      expect(Command.convertParamsToValue({ "deactivate": true }, {}, { "customData": { "inverted": true } })).toBe("ON");
      expect(Command.convertParamsToValue({ "deactivate": false }, {}, { "customData": { "inverted": true } })).toBe("OFF");
    });
  });
});

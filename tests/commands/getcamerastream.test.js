const Command = require('../../functions/commands/getcamerastream.js');

describe('GetCameraStream Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ "StreamToChromecast": true })).toBe(false);
    expect(Command.validateParams({ "StreamToChromecast": true, "SupportedStreamProtocols": {} })).toBe(true);
  });

  test('requiresItem', () => {
    expect(Command.requiresItem()).toBe(true);
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue()).toBe(null);
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates({}, { "state": "https://example.org" })).toStrictEqual({
      "cameraStreamAccessUrl": "https://example.org"
    });
  });
});

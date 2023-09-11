const Command = require('../../functions/commands/setfanspeedpercent.js');

describe('SetFanSpeed Command', () => {
  const params = { fanSpeedPercent: 50 };

  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams(params)).toBe(true);
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue(params)).toBe('50');
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates(params)).toStrictEqual({ currentFanSpeedPercent: 50 });
  });
});

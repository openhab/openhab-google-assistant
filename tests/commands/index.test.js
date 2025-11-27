const findCommandHandler = require('../../functions/commandMatcher.js').findCommandHandler;

describe('Command Matcher', () => {
  test('findCommandHandler', () => {
    const command = findCommandHandler('action.devices.commands.OnOff', { on: true });
    expect(command).not.toBeUndefined();
    expect(command.type).toBe('action.devices.commands.OnOff');
  });
});

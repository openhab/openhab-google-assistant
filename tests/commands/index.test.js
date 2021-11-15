const getCommandType = require('../../functions/commands/index.js').getCommandType;

describe('Commands Index', () => {
  test('getCommandType', () => {
    const command = getCommandType('action.devices.commands.OnOff', { on: true });
    expect(command).not.toBeUndefined();
    expect(command.name).toBe('OnOff');
  });
});

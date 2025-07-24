const Command = require('../../functions/commands/dock.js');

describe('Dock Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams()).toBe(true);
    expect(Command.validateParams({})).toBe(true);
    expect(Command.validateParams({ anyParam: 'value' })).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName - Group with vacuumDock member', () => {
      const device = {
        id: 'VacuumGroup',
        customData: {
          deviceType: 'Vacuum',
          members: {
            vacuumDock: 'VacuumDockSwitch'
          }
        }
      };
      expect(Command.getItemName(device)).toBe('VacuumDockSwitch');
    });

    test('getItemName - simple Switch item', () => {
      const device = {
        id: 'VacuumSwitch',
        customData: {
          itemType: 'Switch'
        }
      };
      expect(Command.getItemName(device)).toBe('VacuumSwitch');
    });
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue()).toBe('ON');
    expect(Command.convertParamsToValue({})).toBe('ON');
    expect(Command.convertParamsToValue({ anyParam: 'value' })).toBe('ON');
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates()).toStrictEqual({
      isDocked: true,
      isRunning: false,
      isPaused: false
    });
  });

  test('checkCurrentState', () => {
    expect(Command.checkCurrentState('OFF', 'ON')).toBeUndefined();

    expect.assertions(2);
    try {
      Command.checkCurrentState('ON', 'ON');
    } catch (e) {
      expect(e.errorCode).toBe('alreadyDocked');
    }
  });
});

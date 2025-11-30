const Command = require('../../functions/commands/locate.js');

describe('Locate Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams()).toBe(true);
    expect(Command.validateParams({})).toBe(true);
    expect(Command.validateParams({ anyParam: 'value' })).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName - Group with vacuumLocate member', () => {
      const device = {
        id: 'VacuumGroup',
        customData: {
          deviceType: 'Vacuum',
          members: {
            vacuumLocate: 'VacuumLocateSwitch'
          }
        }
      };
      expect(Command.getItemName(device)).toBe('VacuumLocateSwitch');
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

  test('checkCurrentState', () => {
    // Locate command can always be executed
    expect(Command.checkCurrentState('ON', 'ON')).toBeUndefined();
    expect(Command.checkCurrentState('OFF', 'ON')).toBeUndefined();
    expect(Command.checkCurrentState('ON', 'OFF')).toBeUndefined();
  });
});

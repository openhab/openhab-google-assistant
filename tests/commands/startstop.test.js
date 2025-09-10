const Command = require('../../functions/commands/startstop.js');

describe('StartStop Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ start: true })).toBe(true);
    expect(Command.validateParams({ start: '1' })).toBe(false);
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(Command.convertParamsToValue({ start: true }, {}, {})).toBe('ON');
      expect(Command.convertParamsToValue({ start: false }, {}, {})).toBe('OFF');
    });

    test('convertParamsToValue Rollershutter', () => {
      const device = { customData: { itemType: 'Rollershutter' } };
      expect(Command.convertParamsToValue({ start: true }, {}, device)).toBe('MOVE');
      expect(Command.convertParamsToValue({ start: false }, {}, device)).toBe('STOP');
    });

    test('convertParamsToValue Contact', () => {
      const device = { customData: { itemType: 'Contact' } };
      expect(() => {
        Command.convertParamsToValue({}, {}, device);
      }).toThrow();
    });
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates({ start: true })).toStrictEqual({ isRunning: true, isPaused: false });
    expect(Command.getResponseStates({ start: false })).toStrictEqual({ isRunning: false, isPaused: true });
  });

  test('checkCurrentState', () => {
    expect.assertions(4);

    expect(Command.checkCurrentState('ON', 'OFF', { start: true })).toBeUndefined();
    try {
      Command.checkCurrentState('ON', 'ON', { start: true });
    } catch (e) {
      expect(e.errorCode).toBe('alreadyStarted');
    }

    expect(Command.checkCurrentState('OFF', 'ON', { start: false })).toBeUndefined();
    try {
      Command.checkCurrentState('OFF', 'OFF', { start: false });
    } catch (e) {
      expect(e.errorCode).toBe('alreadyStopped');
    }
  });

  describe('getItemName', () => {
    test('getItemName - simple device', () => {
      const device = { id: 'SimpleDevice' };
      expect(Command.getItemName(device)).toBe('SimpleDevice');
    });

    test('getItemName - Vacuum with vacuumPower member', () => {
      const device = {
        id: 'VacuumGroup',
        customData: {
          deviceType: 'Vacuum',
          members: {
            vacuumPower: 'VacuumPowerSwitch'
          }
        }
      };
      expect(Command.getItemName(device)).toBe('VacuumPowerSwitch');
    });

    test('getItemName - Vacuum without vacuumPower member', () => {
      const device = {
        id: 'VacuumGroup',
        customData: {
          deviceType: 'Vacuum',
          members: {}
        }
      };
      expect(() => {
        Command.getItemName(device);
      }).toThrow();
    });
  });
});

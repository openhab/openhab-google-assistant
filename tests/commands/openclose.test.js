const Command = require('../../functions/commands/openclose.js');

describe('OpenClose Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ openPercent: 100 })).toBe(true);
    expect(Command.validateParams({ openPercent: '5' })).toBe(false);
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(Command.convertParamsToValue({ openPercent: 0 }, {}, {})).toBe('0');
      expect(Command.convertParamsToValue({ openPercent: 20 }, {}, {})).toBe('20');
      expect(Command.convertParamsToValue({ openPercent: 50 }, {}, {})).toBe('50');
      expect(Command.convertParamsToValue({ openPercent: 70 }, {}, {})).toBe('70');
      expect(Command.convertParamsToValue({ openPercent: 100 }, {}, {})).toBe('100');
    });

    test('convertParamsToValue inverted', () => {
      const device = { customData: { inverted: true } };
      expect(Command.convertParamsToValue({ openPercent: 0 }, {}, device)).toBe('100');
      expect(Command.convertParamsToValue({ openPercent: 20 }, {}, device)).toBe('80');
      expect(Command.convertParamsToValue({ openPercent: 50 }, {}, device)).toBe('50');
      expect(Command.convertParamsToValue({ openPercent: 70 }, {}, device)).toBe('30');
      expect(Command.convertParamsToValue({ openPercent: 100 }, {}, device)).toBe('0');
    });

    test('convertParamsToValue Rollershutter', () => {
      const device = { customData: { itemType: 'Rollershutter' } };
      expect(Command.convertParamsToValue({ openPercent: 0 }, {}, device)).toBe('DOWN');
      expect(Command.convertParamsToValue({ openPercent: 20 }, {}, device)).toBe('80');
      expect(Command.convertParamsToValue({ openPercent: 100 }, {}, device)).toBe('UP');
    });

    test('convertParamsToValue Switch', () => {
      const device = { customData: { itemType: 'Switch' } };
      expect(Command.convertParamsToValue({ openPercent: 0 }, {}, device)).toBe('OFF');
      expect(Command.convertParamsToValue({ openPercent: 20 }, {}, device)).toBe('ON');
      expect(Command.convertParamsToValue({ openPercent: 100 }, {}, device)).toBe('ON');
    });

    test('convertParamsToValue Contact', () => {
      const device = { customData: { itemType: 'Contact' } };
      expect(() => {
        Command.convertParamsToValue({}, {}, device);
      }).toThrow();
    });

    test('convertParamsToValue Group with shutterPosition member', () => {
      const device = {
        customData: {
          itemType: 'Group',
          members: {
            shutterPosition: 'TestGroup_Position'
          }
        }
      };
      // Group shutters are always treated as Rollershutter type
      expect(Command.convertParamsToValue({ openPercent: 0 }, {}, device)).toBe('DOWN');
      expect(Command.convertParamsToValue({ openPercent: 20 }, {}, device)).toBe('80');
      expect(Command.convertParamsToValue({ openPercent: 100 }, {}, device)).toBe('UP');
    });

    test('convertParamsToValue Group inverted', () => {
      const device = {
        customData: {
          itemType: 'Group',
          inverted: true,
          members: {
            shutterPosition: 'TestGroup_Position'
          }
        }
      };
      // Group shutters are always treated as Rollershutter type
      expect(Command.convertParamsToValue({ openPercent: 0 }, {}, device)).toBe('UP');
      expect(Command.convertParamsToValue({ openPercent: 100 }, {}, device)).toBe('DOWN');
    });
  });

  test('getItemName', () => {
    // Single item case
    expect(Command.getItemName({ id: 'TestItem' })).toBe('TestItem');

    // Group with shutterPosition member
    const groupDevice = {
      id: 'TestGroup',
      customData: {
        members: {
          shutterPosition: 'TestGroup_Position'
        }
      }
    };
    expect(Command.getItemName(groupDevice)).toBe('TestGroup_Position');

    // Group without shutterPosition member
    const groupDeviceNoMembers = {
      id: 'TestGroup',
      customData: {
        members: {}
      }
    };
    expect(Command.getItemName(groupDeviceNoMembers)).toBe('TestGroup');
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates({ openPercent: 10 })).toStrictEqual({ openPercent: 10 });
  });

  describe('checkCurrentState', () => {
    test('Switch', () => {
      expect.assertions(8);

      expect(Command.checkCurrentState('ON', 'OFF', { openPercent: 100 })).toBeUndefined();
      try {
        Command.checkCurrentState('ON', 'ON', { openPercent: 100 });
      } catch (e) {
        expect(e.errorCode).toBe('alreadyOpen');
      }

      expect(Command.checkCurrentState('OFF', 'ON', { openPercent: 0 })).toBeUndefined();
      try {
        Command.checkCurrentState('OFF', 'OFF', { openPercent: 0 });
      } catch (e) {
        expect(e.errorCode).toBe('alreadyClosed');
      }

      expect(Command.checkCurrentState('UP', '100', { openPercent: 100 })).toBeUndefined();
      try {
        Command.checkCurrentState('UP', '0', { openPercent: 100 });
      } catch (e) {
        expect(e.errorCode).toBe('alreadyOpen');
      }

      expect(Command.checkCurrentState('DOWN', '0', { openPercent: 0 })).toBeUndefined();
      try {
        Command.checkCurrentState('DOWN', '100', { openPercent: 0 });
      } catch (e) {
        expect(e.errorCode).toBe('alreadyClosed');
      }
    });
  });
});

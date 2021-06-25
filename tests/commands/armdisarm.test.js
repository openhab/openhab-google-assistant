const Command = require('../../functions/commands/armdisarm.js');
const SecuritySystem = require('../../functions/devices/securitysystem.js');

describe('ArmDisarm Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ arm: true })).toBe(true);
    expect(Command.validateParams({ arm: 'true' })).toBe(false);
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(Command.convertParamsToValue({ arm: true }, { type: 'Group' }, {})).toBe('ON');
      expect(Command.convertParamsToValue({ arm: false }, { type: 'Group' }, {})).toBe('OFF');
      expect(Command.convertParamsToValue({ arm: true, armLevel: 'L1' }, { type: 'Group' }, {})).toBe('L1');
    });

    test('convertParamsToValue inverted', () => {
      expect(Command.convertParamsToValue({ arm: true }, {}, { customData: { inverted: true } })).toBe('OFF');
      expect(Command.convertParamsToValue({ arm: false }, {}, { customData: { inverted: true } })).toBe('ON');
    });
  });
  test('getResponseStates', () => {
    expect(Command.getResponseStates({ arm: true })).toStrictEqual({ isArmed: true });
    expect(Command.getResponseStates({ arm: true, armLevel: 'L1' })).toStrictEqual({
      isArmed: true,
      currentArmLevel: 'L1'
    });
  });

  test('getItemName', () => {
    const nameArmed = 'itemNameArmed';
    const nameArmLevel = 'itemNameArmLevel';

    const item = {
      members: [
        {
          name: nameArmed,
          metadata: { ga: { value: SecuritySystem.armedMemberName } }
        },
        {
          name: nameArmLevel,
          metadata: { ga: { value: SecuritySystem.armLevelMemberName } }
        }
      ]
    };
    expect(Command.getItemName(item, null, { arm: true })).toStrictEqual(nameArmed);
    expect(Command.getItemName(item, null, { arm: true, armLevel: 'L1' })).toStrictEqual(nameArmLevel);
  });

  test('requiresItem', () => {
    expect(Command.requiresItem()).toBe(true);
  });

  test('shouldValidateStateChange', () => {
    expect(Command.shouldValidateStateChange()).toBe(true);
  });

  describe('validateStateChange', () => {
    const item = {
      type: 'Group',
      members: [
        {
          state: 'ON',
          metadata: { ga: { value: SecuritySystem.armedMemberName } }
        },
        {
          state: 'L0',
          metadata: { ga: { value: SecuritySystem.armLevelMemberName } }
        }
      ]
    };

    test('arming without level', () => {
      item.members[0].state = 'OFF';
      expect(Command.validateStateChange({ arm: true }, item)).toBeUndefined();

      item.members[0].state = 'ON';
      expect(Command.validateStateChange({ arm: true }, item, { id: '123' })).toStrictEqual({
        ids: ['123'],
        status: 'ERROR',
        errorCode: 'alreadyArmed'
      });
    });

    test('arming with level', () => {
      item.members[0].state = 'OFF';
      item.members[1].state = 'L1';
      expect(Command.validateStateChange({ arm: true, armLevel: 'L2' }, item)).toBeUndefined();

      item.members[0].state = 'ON';
      expect(Command.validateStateChange({ arm: true, armLevel: 'L1' }, item, { id: '123' })).toStrictEqual({
        ids: ['123'],
        status: 'ERROR',
        errorCode: 'alreadyInState'
      });
    });

    test('disarming', () => {
      item.members[0].state = 'ON';
      expect(Command.validateStateChange({ arm: false }, item)).toBeUndefined();

      item.members[0].state = 'OFF';
      expect(Command.validateStateChange({ arm: false }, item, { id: '123' })).toStrictEqual({
        ids: ['123'],
        status: 'ERROR',
        errorCode: 'alreadyDisarmed'
      });
    });
  });

  describe('checkUpdateFailed', () => {
    const item = {
      members: [
        {
          metadata: { ga: { value: SecuritySystem.armedMemberName } }
        },
        {
          metadata: { ga: { value: SecuritySystem.armLevelMemberName } }
        }
      ]
    };

    test('arming without level', () => {
      item.members[0].state = 'ON';
      expect(Command.checkUpdateFailed({ arm: true }, item)).toBeUndefined();

      item.members[0].state = 'OFF';
      expect(Command.checkUpdateFailed({ arm: true }, item, { id: '123' })).toStrictEqual({
        ids: ['123'],
        status: 'ERROR',
        errorCode: 'armFailure'
      });
    });

    test('arming with level', () => {
      item.members[0].state = 'ON';
      item.members[1].state = 'L1';
      expect(Command.checkUpdateFailed({ arm: true, armLevel: 'L1' }, item)).toBeUndefined();

      item.members[0].state = 'OFF';
      expect(Command.checkUpdateFailed({ arm: true, armLevel: 'L1' }, item, { id: '123' })).toStrictEqual({
        ids: ['123'],
        status: 'ERROR',
        errorCode: 'armFailure'
      });

      item.members[0].state = 'OFF';
      expect(Command.checkUpdateFailed({ arm: true, armLevel: 'L3' }, item, { id: '123' })).toStrictEqual({
        ids: ['123'],
        status: 'ERROR',
        errorCode: 'armFailure'
      });
    });

    test('disarming', () => {
      item.members[0].state = 'OFF';
      expect(Command.checkUpdateFailed({ arm: false }, item)).toBeUndefined();

      item.members[0].state = 'ON';
      expect(Command.checkUpdateFailed({ arm: false }, item, { id: '123' })).toStrictEqual({
        ids: ['123'],
        status: 'ERROR',
        errorCode: 'disarmFailure'
      });
    });
  });

  describe('getNewState', () => {
    const item = {
      type: 'Group',
      members: [
        {
          metadata: { ga: { value: SecuritySystem.armedMemberName } }
        },
        {
          metadata: { ga: { value: SecuritySystem.armLevelMemberName } }
        }
      ]
    };

    test('armed', () => {
      item.members[0].state = 'ON';
      expect(Command.getNewState({ arm: true }, item)).toStrictEqual({ isArmed: true, online: true });
    });

    test('armed with level', () => {
      item.members[0].state = 'ON';
      item.members[1].state = 'L1';
      expect(Command.getNewState({ arm: true, armLevel: 'L1' }, item)).toStrictEqual({
        isArmed: true,
        currentArmLevel: 'L1',
        online: true
      });
    });

    test('disarmed', () => {
      item.members[0].state = 'OFF';
      expect(Command.getNewState({ arm: false }, item)).toStrictEqual({ isArmed: false, online: true });
    });
  });
});

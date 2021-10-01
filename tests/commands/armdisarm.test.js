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
      expect(Command.convertParamsToValue({ arm: true }, {}, {})).toBe('ON');
      expect(Command.convertParamsToValue({ arm: false }, {}, {})).toBe('OFF');
      expect(
        Command.convertParamsToValue(
          { arm: true, armLevel: 'L1' },
          {},
          { customData: { deviceType: 'SecuritySystem' } }
        )
      ).toBe('L1');
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

  describe('getItemName', () => {
    test('getItemName SimpleSecuritySystem', () => {
      expect(
        Command.getItemName({ name: 'SwitchItem' }, { customData: { deviceType: 'SimpleSecuritySystem' } })
      ).toStrictEqual('SwitchItem');
    });

    describe('getItemName SecuritySystem', () => {
      const itemNameArmed = 'itemNameArmed';
      const itemNameArmLevel = 'itemNameArmLevel';

      test('getItemName SecuritySystem normal', () => {
        const item = {
          members: [
            {
              name: itemNameArmed,
              metadata: { ga: { value: SecuritySystem.armedMemberName } }
            },
            {
              name: itemNameArmLevel,
              metadata: { ga: { value: SecuritySystem.armLevelMemberName } }
            }
          ]
        };
        expect(
          Command.getItemName(item, { customData: { deviceType: 'SecuritySystem' } }, { arm: true })
        ).toStrictEqual(itemNameArmed);
        expect(
          Command.getItemName(item, { customData: { deviceType: 'SecuritySystem' } }, { arm: true, armLevel: 'L1' })
        ).toStrictEqual(itemNameArmLevel);
      });

      test('getItemName SecuritySystem missing armed member', () => {
        const item = {
          members: [
            {
              name: itemNameArmLevel,
              metadata: { ga: { value: SecuritySystem.armLevelMemberName } }
            }
          ]
        };
        expect(() => {
          Command.getItemName(item, { customData: { deviceType: 'SecuritySystem' } }, { arm: true });
        }).toThrow();
      });

      test('getItemName SecuritySystem missing armLevel member', () => {
        const item = {
          members: [
            {
              name: itemNameArmed,
              metadata: { ga: { value: SecuritySystem.armedMemberName } }
            }
          ]
        };
        expect(() => {
          Command.getItemName(item, { customData: { deviceType: 'SecuritySystem' } }, { arm: true, armLevel: 'L1' });
        }).toThrow();
      });
    });
  });

  test('requiresItem', () => {
    expect(Command.requiresItem()).toBe(true);
  });

  test('shouldValidateStateChange', () => {
    expect(Command.shouldValidateStateChange()).toBe(true);
  });

  describe('validateStateChange', () => {
    test('validateStateChange SimpleSecuritySystem', () => {
      const item = { type: 'Switch', state: 'ON' };
      expect(Command.validateStateChange({ arm: true }, item, { id: '123' })).toStrictEqual({
        ids: ['123'],
        status: 'ERROR',
        errorCode: 'alreadyArmed'
      });
      expect(Command.validateStateChange({ arm: false }, item, {})).toBeUndefined();

      item.state = 'OFF';
      expect(Command.validateStateChange({ arm: true }, item, {})).toBeUndefined();
      expect(Command.validateStateChange({ arm: false }, item, { id: '123' })).toStrictEqual({
        ids: ['123'],
        status: 'ERROR',
        errorCode: 'alreadyDisarmed'
      });
    });

    describe('validateStateChange SecuritySystem', () => {
      const item = {
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
        expect(
          Command.validateStateChange({ arm: true }, item, { id: '123', customData: { deviceType: 'SecuritySystem' } })
        ).toStrictEqual({
          ids: ['123'],
          status: 'ERROR',
          errorCode: 'alreadyArmed'
        });

        item.members[0].state = 'OFF';
        expect(
          Command.validateStateChange({ arm: true }, item, { customData: { deviceType: 'SecuritySystem' } })
        ).toBeUndefined();
      });

      test('arming with level', () => {
        item.members[0].state = 'OFF';
        item.members[1].state = 'L1';
        expect(
          Command.validateStateChange({ arm: true, armLevel: 'L2' }, item, {
            customData: { deviceType: 'SecuritySystem' }
          })
        ).toBeUndefined();

        item.members[0].state = 'ON';
        expect(
          Command.validateStateChange({ arm: true, armLevel: 'L1' }, item, {
            id: '123',
            customData: { deviceType: 'SecuritySystem' }
          })
        ).toStrictEqual({
          ids: ['123'],
          status: 'ERROR',
          errorCode: 'alreadyInState'
        });
      });

      test('disarming', () => {
        item.members[0].state = 'ON';
        expect(
          Command.validateStateChange({ arm: false }, item, { customData: { deviceType: 'SecuritySystem' } })
        ).toBeUndefined();

        item.members[0].state = 'OFF';
        expect(
          Command.validateStateChange({ arm: false }, item, { id: '123', customData: { deviceType: 'SecuritySystem' } })
        ).toStrictEqual({
          ids: ['123'],
          status: 'ERROR',
          errorCode: 'alreadyDisarmed'
        });
      });
    });
  });

  describe('checkUpdateFailed', () => {
    test('checkUpdateFailed SimpleSecuritySystem', () => {
      const item = {
        state: 'ON'
      };
      expect(Command.checkUpdateFailed({ arm: true }, item, {})).toBeUndefined();
      expect(Command.checkUpdateFailed({ arm: false }, item, { id: '123' })).toStrictEqual({
        ids: ['123'],
        status: 'ERROR',
        errorCode: 'disarmFailure'
      });

      item.state = 'OFF';
      expect(Command.checkUpdateFailed({ arm: false }, item, {})).toBeUndefined();
      expect(Command.checkUpdateFailed({ arm: true }, item, { id: '123' })).toStrictEqual({
        ids: ['123'],
        status: 'ERROR',
        errorCode: 'armFailure'
      });
    });

    describe('checkUpdateFailed SecuritySystem', () => {
      const item = {
        name: 'itemName',
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
        expect(
          Command.checkUpdateFailed({ arm: true }, item, { customData: { deviceType: 'SecuritySystem' } })
        ).toBeUndefined();
        expect(
          Command.checkUpdateFailed({ arm: false }, item, { id: '123', customData: { deviceType: 'SecuritySystem' } })
        ).toStrictEqual({
          ids: ['123'],
          status: 'ERROR',
          errorCode: 'disarmFailure'
        });

        item.members[0].state = 'OFF';
        expect(
          Command.checkUpdateFailed({ arm: false }, item, { customData: { deviceType: 'SecuritySystem' } })
        ).toBeUndefined();
        expect(
          Command.checkUpdateFailed({ arm: true }, item, { id: '123', customData: { deviceType: 'SecuritySystem' } })
        ).toStrictEqual({
          ids: ['123'],
          status: 'ERROR',
          errorCode: 'armFailure'
        });

        const item2 = {
          name: 'itemName',
          members: [
            { metadata: { ga: { value: SecuritySystem.armedMemberName } } },
            { metadata: { ga: { value: SecuritySystem.armLevelMemberName } } },
            { name: 'trouble', metadata: { ga: { value: 'securitySystemTrouble' } }, state: 'ON' },
            { name: 'errorCode', metadata: { ga: { value: 'securitySystemTroubleCode' } }, state: 'ErrorCode123' }
          ]
        };
        expect(
          Command.checkUpdateFailed({ arm: true }, item2, { id: '123', customData: { deviceType: 'SecuritySystem' } })
        ).toStrictEqual({
          ids: ['123'],
          states: {
            currentStatusReport: [
              {
                blocking: false,
                deviceTarget: 'itemName',
                priority: 0,
                statusCode: 'ErrorCode123'
              }
            ],
            isArmed: false,
            online: true
          },
          status: 'EXCEPTIONS'
        });
      });

      test('arming with level', () => {
        item.members[0].state = 'ON';
        item.members[1].state = 'L1';
        expect(
          Command.checkUpdateFailed({ arm: true, armLevel: 'L1' }, item, {
            customData: { deviceType: 'SecuritySystem' }
          })
        ).toBeUndefined();

        item.members[0].state = 'OFF';
        expect(
          Command.checkUpdateFailed({ arm: true, armLevel: 'L1' }, item, {
            id: '123',
            customData: { deviceType: 'SecuritySystem' }
          })
        ).toStrictEqual({
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
        expect(
          Command.checkUpdateFailed({ arm: false }, item, { customData: { deviceType: 'SecuritySystem' } })
        ).toBeUndefined();

        item.members[0].state = 'ON';
        expect(
          Command.checkUpdateFailed({ arm: false }, item, { id: '123', customData: { deviceType: 'SecuritySystem' } })
        ).toStrictEqual({
          ids: ['123'],
          status: 'ERROR',
          errorCode: 'disarmFailure'
        });
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
      expect(Command.getNewState({ arm: true }, item, {})).toStrictEqual({ isArmed: true, online: true });
    });

    test('armed with level', () => {
      item.members[0].state = 'ON';
      item.members[1].state = 'L1';
      expect(Command.getNewState({ arm: true, armLevel: 'L1' }, item, {})).toStrictEqual({
        isArmed: true,
        currentArmLevel: 'L1',
        online: true
      });
    });

    test('disarmed', () => {
      item.members[0].state = 'OFF';
      expect(Command.getNewState({ arm: false }, item, {})).toStrictEqual({ isArmed: false, online: true });
    });
  });
});

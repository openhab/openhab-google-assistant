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
        Command.getItemNameAndState(
          { name: 'SwitchItem', state: 'ON' },
          { customData: { deviceType: 'SimpleSecuritySystem' } }
        )
      ).toStrictEqual({ name: 'SwitchItem', state: 'ON' });
    });

    describe('getItemName SecuritySystem', () => {
      const itemNameArmed = 'itemNameArmed';
      const itemNameArmLevel = 'itemNameArmLevel';

      test('getItemName SecuritySystem normal', () => {
        const item = {
          members: [
            {
              name: itemNameArmed,
              state: 'ON',
              metadata: { ga: { value: SecuritySystem.armedMemberName } }
            },
            {
              name: itemNameArmLevel,
              state: 'L1',
              metadata: { ga: { value: SecuritySystem.armLevelMemberName } }
            }
          ]
        };
        expect(
          Command.getItemNameAndState(item, { customData: { deviceType: 'SecuritySystem' } }, { arm: true })
        ).toStrictEqual({ config: {}, name: 'itemNameArmed', state: 'ON' });
        expect(
          Command.getItemNameAndState(
            item,
            { customData: { deviceType: 'SecuritySystem' } },
            { arm: true, armLevel: 'L1' }
          )
        ).toStrictEqual({ config: {}, name: 'itemNameArmLevel', state: 'L1' });
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
          Command.getItemNameAndState(item, { customData: { deviceType: 'SecuritySystem' } }, { arm: true });
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
          Command.getItemNameAndState(
            item,
            { customData: { deviceType: 'SecuritySystem' } },
            { arm: true, armLevel: 'L1' }
          );
        }).toThrow();
      });
    });
  });

  test('requiresItem', () => {
    expect(Command.requiresItem()).toBe(true);
  });

  test('requiresUpdateValidation', () => {
    expect(Command.requiresUpdateValidation).toBe(true);
  });

  test('bypassPin', () => {
    expect(Command.bypassPin({ customData: {} }, {})).toBe(false);
    expect(Command.bypassPin({ customData: { pinOnDisarmOnly: true } }, {})).toBe(false);
    expect(Command.bypassPin({ customData: { pinOnDisarmOnly: true } }, { arm: true })).toBe(true);
    expect(Command.bypassPin({ customData: { pinOnDisarmOnly: true } }, { armLevel: 'L1' })).toBe(true);
  });

  test('checkCurrentState', () => {
    expect.assertions(6);

    expect(Command.checkCurrentState('ON', 'OFF', { arm: true })).toBeUndefined();
    try {
      Command.checkCurrentState('ON', 'ON', { arm: true });
    } catch (e) {
      expect(e.errorCode).toBe('alreadyArmed');
    }

    expect(Command.checkCurrentState('OFF', 'ON', { arm: false })).toBeUndefined();
    try {
      Command.checkCurrentState('OFF', 'OFF', { arm: false });
    } catch (e) {
      expect(e.errorCode).toBe('alreadyDisarmed');
    }

    expect(Command.checkCurrentState('L2', 'L1', { arm: true, armLevel: 'L2' })).toBeUndefined();

    try {
      Command.checkCurrentState('L2', 'L2', { arm: true, armLevel: 'L2' });
    } catch (e) {
      expect(e.errorCode).toBe('alreadyInState');
    }
  });

  describe('validateUpdate', () => {
    test('validateUpdate SimpleSecuritySystem', () => {
      expect.assertions(6);
      const item = {
        state: 'ON'
      };
      expect(Command.validateUpdate({ arm: true }, item, {})).toBeUndefined();
      try {
        Command.validateUpdate({ arm: false }, item, {});
      } catch (e) {
        expect(e.errorCode).toBe('disarmFailure');
      }

      item.state = 'OFF';
      expect(Command.validateUpdate({ arm: false }, item, {})).toBeUndefined();
      try {
        Command.validateUpdate({ arm: true }, item, {});
      } catch (e) {
        expect(e.errorCode).toBe('armFailure');
      }

      item.state = 'ON';
      expect(Command.validateUpdate({ arm: false }, item, { customData: { inverted: true } })).toBeUndefined();
      try {
        Command.validateUpdate({ arm: true }, item, { customData: { inverted: true } });
      } catch (e) {
        expect(e.errorCode).toBe('armFailure');
      }
    });

    describe('validateUpdate SecuritySystem', () => {
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
        expect.assertions(7);
        item.members[0].state = 'ON';
        expect(
          Command.validateUpdate({ arm: true }, item, { customData: { deviceType: 'SecuritySystem' } })
        ).toBeUndefined();

        try {
          Command.validateUpdate({ arm: false }, item, { customData: { deviceType: 'SecuritySystem' } });
        } catch (e) {
          expect(e.errorCode).toBe('disarmFailure');
        }

        item.members[0].state = 'OFF';
        expect(
          Command.validateUpdate({ arm: false }, item, { customData: { deviceType: 'SecuritySystem' } })
        ).toBeUndefined();
        try {
          Command.validateUpdate({ arm: true }, item, { customData: { deviceType: 'SecuritySystem' } });
        } catch (e) {
          expect(e.errorCode).toBe('armFailure');
        }

        item.members[0].state = 'ON';
        expect(
          Command.validateUpdate({ arm: false }, item, {
            customData: { deviceType: 'SecuritySystem', inverted: true }
          })
        ).toBeUndefined();
        try {
          Command.validateUpdate({ arm: true }, item, {
            customData: { deviceType: 'SecuritySystem', inverted: true }
          });
        } catch (e) {
          expect(e.errorCode).toBe('armFailure');
        }

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
          Command.validateUpdate({ arm: true }, item2, { id: '123', customData: { deviceType: 'SecuritySystem' } })
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
        expect.assertions(3);
        item.members[0].state = 'ON';
        item.members[1].state = 'L1';
        expect(
          Command.validateUpdate({ arm: true, armLevel: 'L1' }, item, {
            customData: { deviceType: 'SecuritySystem' }
          })
        ).toBeUndefined();

        item.members[0].state = 'OFF';
        try {
          Command.validateUpdate({ arm: true, armLevel: 'L1' }, item, {
            customData: { deviceType: 'SecuritySystem' }
          });
        } catch (e) {
          expect(e.errorCode).toBe('armFailure');
        }

        item.members[0].state = 'OFF';
        try {
          Command.validateUpdate({ arm: true, armLevel: 'L3' }, item, {});
        } catch (e) {
          expect(e.errorCode).toBe('armFailure');
        }
      });

      test('disarming', () => {
        expect.assertions(2);
        item.members[0].state = 'OFF';
        expect(
          Command.validateUpdate({ arm: false }, item, { customData: { deviceType: 'SecuritySystem' } })
        ).toBeUndefined();

        item.members[0].state = 'ON';
        try {
          Command.validateUpdate({ arm: false }, item, { customData: { deviceType: 'SecuritySystem' } });
        } catch (e) {
          expect(e.errorCode).toBe('disarmFailure');
        }
      });
    });
  });
});

const Command = require('../../functions/commands/charge.js');

describe('Charge Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ charge: true })).toBe(true);
  });

  test('requiresItem', () => {
    expect(Command.requiresItem()).toBe(true);
  });

  test('getItemName', () => {
    expect(() => {
      Command.getItemNameAndState({ name: 'Item' });
    }).toThrow();

    const item = {
      members: [
        {
          name: 'ChargingItem',
          state: '80',
          metadata: {
            ga: {
              value: 'chargerCharging'
            }
          }
        }
      ]
    };
    expect(Command.getItemNameAndState(item)).toStrictEqual({ name: 'ChargingItem', state: '80' });
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(Command.convertParamsToValue({ charge: true }, {}, {})).toBe('ON');
    });

    test('convertParamsToValue inverted', () => {
      expect(Command.convertParamsToValue({ charge: true }, {}, { customData: { inverted: true } })).toBe('OFF');
    });
  });

  test('getResponseStates', () => {
    const item = {
      members: [
        {
          metadata: {
            ga: {
              value: 'chargerCharging'
            }
          },
          state: 'OFF'
        },
        {
          metadata: {
            ga: {
              value: 'chargerCapacityRemaining'
            }
          },
          state: '50'
        }
      ]
    };
    expect(Command.getResponseStates({ charge: true }, item)).toStrictEqual({
      isCharging: true,
      descriptiveCapacityRemaining: 'MEDIUM',
      capacityRemaining: [
        {
          rawValue: 50,
          unit: 'PERCENTAGE'
        }
      ]
    });
    expect(Command.getResponseStates({ charge: false }, item)).toStrictEqual({
      isCharging: false,
      descriptiveCapacityRemaining: 'MEDIUM',
      capacityRemaining: [
        {
          rawValue: 50,
          unit: 'PERCENTAGE'
        }
      ]
    });
  });
});

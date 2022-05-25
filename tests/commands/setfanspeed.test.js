const Command = require('../../functions/commands/setfanspeed.js');

describe('SetFanSpeed Command', () => {
  const params = { fanSpeed: '50' };

  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams(params)).toBe(true);
  });

  test('requiresItem', () => {
    expect(Command.requiresItem({})).toBe(false);
    expect(Command.requiresItem({ customData: { deviceType: 'ACUnit' } })).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName', () => {
      expect(Command.getItemName({ name: 'Item' }, {})).toBe('Item');
    });

    test('getItemName ACUnit', () => {
      expect(() => {
        Command.getItemName({ name: 'Item' }, { customData: { deviceType: 'ACUnit' } });
      }).toThrow();

      const item = {
        members: [
          {
            name: 'PowerItem',
            metadata: {
              ga: {
                value: 'fanPower'
              }
            }
          }
        ]
      };
      expect(Command.getItemName(item, { customData: { deviceType: 'ACUnit' } })).toBe('PowerItem');
    });
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue(params)).toBe('50');
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates(params)).toStrictEqual({ currentFanSpeedSetting: '50' });
  });
});

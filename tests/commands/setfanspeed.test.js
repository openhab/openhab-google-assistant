const Command = require('../../functions/commands/setfanspeed.js');

describe('SetFanSpeed Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ fanSpeed: '50' })).toBe(true);
    expect(Command.validateParams({ fanSpeedPercent: 50 })).toBe(true);
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
            name: 'SpeedItem',
            metadata: {
              ga: {
                value: 'fanSpeed'
              }
            }
          }
        ]
      };
      expect(Command.getItemName(item, { customData: { deviceType: 'ACUnit' } })).toBe('SpeedItem');
    });
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue({ fanSpeed: '50' })).toStrictEqual('50');
    expect(Command.convertParamsToValue({ fanSpeedPercent: 50 })).toStrictEqual('50');
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates({ fanSpeed: '50' })).toStrictEqual({
      currentFanSpeedPercent: 50,
      currentFanSpeedSetting: '50'
    });
    expect(Command.getResponseStates({ fanSpeedPercent: 50 })).toStrictEqual({
      currentFanSpeedPercent: 50
    });
  });
});

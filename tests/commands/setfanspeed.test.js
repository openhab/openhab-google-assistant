const Command = require('../../functions/commands/setfanspeed.js');

describe('SetFanSpeed Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ fanSpeed: '50' })).toBe(true);
    expect(Command.validateParams({ fanSpeedPercent: 50 })).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName', () => {
      expect(Command.getItemName({ id: 'Item' })).toBe('Item');
      expect(Command.getItemName({ id: 'Item', customData: {} })).toBe('Item');
    });

    test('getItemName Fan', () => {
      expect(() => {
        Command.getItemName({ id: 'Item', customData: { deviceType: 'Fan', itemType: 'Group' } });
      }).toThrow();
      const device = {
        customData: {
          deviceType: 'Fan',
          itemType: 'Group',
          members: {
            fanSpeed: 'SpeedItem'
          }
        }
      };
      expect(Command.getItemName(device)).toBe('SpeedItem');
      expect(Command.getItemName({ id: 'Item', customData: { deviceType: 'Fan', itemType: 'Dimmer' } })).toBe('Item');
    });

    test('getItemName ACUnit', () => {
      expect(() => {
        Command.getItemName({ id: 'Item', customData: { deviceType: 'ACUnit', itemType: 'Group' } });
      }).toThrow();
      const device = {
        customData: {
          deviceType: 'ACUnit',
          itemType: 'Group',
          members: {
            fanSpeed: 'SpeedItem'
          }
        }
      };
      expect(Command.getItemName(device)).toBe('SpeedItem');
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

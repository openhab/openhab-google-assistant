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

    test('getItemName Humidifier', () => {
      expect(() => {
        Command.getItemName({ id: 'Item', customData: { deviceType: 'Humidifier', itemType: 'Group' } });
      }).toThrow('Humidifier has no humidifierFanSpeed member configured');
      const device = {
        customData: {
          deviceType: 'Humidifier',
          itemType: 'Group',
          members: {
            humidifierFanSpeed: 'HumidifierSpeedItem'
          }
        }
      };
      expect(Command.getItemName(device)).toBe('HumidifierSpeedItem');
      expect(
        Command.getItemName({ id: 'Item', customData: { deviceType: 'Humidifier', itemType: 'Dimmer' } })
      ).toBe('Item');
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

  describe('checkCurrentState', () => {
    test('throws MAX_SPEED_REACHED when at max speed', () => {
      expect(() => {
        Command.checkCurrentState('100', '100', { fanSpeedPercent: 100 });
      }).toThrow('Fan speed is already at the requested level');
    });

    test('throws MIN_SPEED_REACHED when at min speed', () => {
      expect(() => {
        Command.checkCurrentState('0', '0', { fanSpeedPercent: 0 });
      }).toThrow('Fan speed is already at the requested level');
    });

    test('throws ALREADY_IN_STATE for numeric values within tolerance', () => {
      expect(() => {
        Command.checkCurrentState('50', '50.5', { fanSpeedPercent: 50 });
      }).toThrow('Fan speed is already at the requested level');
    });

    test('does not throw for numeric values outside tolerance', () => {
      expect(() => {
        Command.checkCurrentState('50', '52', { fanSpeedPercent: 50 });
      }).not.toThrow();
    });

    test('throws ALREADY_IN_STATE for matching string settings', () => {
      expect(() => {
        Command.checkCurrentState('medium', 'medium', { fanSpeed: 'medium' });
      }).toThrow('Fan speed is already at the requested setting');
    });

    test('does not throw for different string settings', () => {
      expect(() => {
        Command.checkCurrentState('high', 'medium', { fanSpeed: 'high' });
      }).not.toThrow();
    });

    test('does not throw for invalid numeric values', () => {
      expect(() => {
        Command.checkCurrentState('invalid', 'NaN', { fanSpeedPercent: 50 });
      }).not.toThrow();
    });
  });
});

const Command = require('../../functions/commands/onoff.js');

describe('OnOff Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ on: true })).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName', () => {
      expect(Command.getItemName({ id: 'Item' })).toBe('Item');
      expect(Command.getItemName({ id: 'Item', customData: {} })).toBe('Item');
    });

    test('getItemName DynamicModesLight', () => {
      expect(() => {
        Command.getItemName({ id: 'Item', customData: { deviceType: 'DynamicModesLight' } });
      }).toThrow();
    });

    test('getItemName SpecialColorLight', () => {
      expect(() => {
        Command.getItemName({ id: 'Item', customData: { deviceType: 'SpecialColorLight' } });
      }).toThrow();
      const device = {
        id: 'Item',
        customData: {
          deviceType: 'SpecialColorLight',
          members: {
            lightBrightness: 'BrightnessItem'
          }
        }
      };
      expect(Command.getItemName(device)).toBe('BrightnessItem');
      const device_power = {
        id: 'Item',
        customData: {
          deviceType: 'SpecialColorLight',
          members: {
            lightPower: 'PowerItem'
          }
        }
      };
      expect(Command.getItemName(device_power)).toBe('PowerItem');
    });

    test('getItemName TV', () => {
      expect(() => {
        Command.getItemName({ name: 'Item', customData: { deviceType: 'TV' } });
      }).toThrow();
      const device = {
        id: 'Item',
        customData: {
          deviceType: 'TV',
          members: {
            tvPower: 'PowerItem'
          }
        }
      };
      expect(Command.getItemName(device)).toBe('PowerItem');
    });

    test('getItemName Fan', () => {
      expect(() => {
        Command.getItemName({ name: 'Item', customData: { deviceType: 'Fan', itemType: 'Group' } });
      }).toThrow();
      const device = {
        id: 'Item',
        customData: {
          deviceType: 'Fan',
          itemType: 'Group',
          members: {
            fanPower: 'PowerItem'
          }
        }
      };
      expect(Command.getItemName(device)).toBe('PowerItem');
      expect(Command.getItemName({ id: 'Item', customData: { deviceType: 'Fan', itemType: 'Dimmer' } })).toBe('Item');
    });

    test('getItemName ACUnit', () => {
      expect(() => {
        Command.getItemName({ name: 'Item', customData: { deviceType: 'ACUnit', itemType: 'Group' } });
      }).toThrow();
      const device = {
        id: 'Item',
        customData: {
          deviceType: 'ACUnit',
          itemType: 'Group',
          members: {
            fanPower: 'PowerItem'
          }
        }
      };
      expect(Command.getItemName(device)).toBe('PowerItem');
    });

    test('getItemName AirPurifier', () => {
      expect(() => {
        Command.getItemName({ name: 'Item', customData: { deviceType: 'AirPurifier', itemType: 'Group' } });
      }).toThrow();
      const device = {
        id: 'Item',
        customData: {
          deviceType: 'AirPurifier',
          itemType: 'Group',
          members: {
            fanPower: 'PowerItem'
          }
        }
      };
      expect(Command.getItemName(device)).toBe('PowerItem');
    });

    test('getItemName Hood', () => {
      expect(() => {
        Command.getItemName({ name: 'Item', customData: { deviceType: 'Hood', itemType: 'Group' } });
      }).toThrow();
      const device = {
        id: 'Item',
        customData: {
          deviceType: 'Hood',
          itemType: 'Group',
          members: {
            fanPower: 'PowerItem'
          }
        }
      };
      expect(Command.getItemName(device)).toBe('PowerItem');
    });

    test('getItemName Humidifier', () => {
      expect(() => {
        Command.getItemName({ name: 'Item', customData: { deviceType: 'Humidifier', itemType: 'Group' } });
      }).toThrow();
      const device = {
        id: 'Item',
        customData: {
          deviceType: 'Humidifier',
          itemType: 'Group',
          members: {
            humidifierPower: 'PowerItem'
          }
        }
      };
      expect(Command.getItemName(device)).toBe('PowerItem');
      expect(Command.getItemName({ id: 'Item', customData: { deviceType: 'Humidifier', itemType: 'Switch' } })).toBe(
        'Item'
      );
    });
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(Command.convertParamsToValue({ on: true }, {}, {})).toBe('ON');
    });

    test('convertParamsToValue inverted', () => {
      expect(Command.convertParamsToValue({ on: true }, {}, { customData: { inverted: true } })).toBe('OFF');
    });
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates({ on: true })).toStrictEqual({ on: true });
    expect(Command.getResponseStates({ on: false })).toStrictEqual({ on: false });
  });

  test('checkCurrentState', () => {
    expect.assertions(4);

    expect(Command.checkCurrentState('ON', 'OFF', { on: true })).toBeUndefined();
    try {
      Command.checkCurrentState('ON', 'ON', { on: true });
    } catch (e) {
      expect(e.errorCode).toBe('alreadyOn');
    }

    expect(Command.checkCurrentState('OFF', 'ON', { on: false })).toBeUndefined();
    try {
      Command.checkCurrentState('OFF', 'OFF', { on: false });
    } catch (e) {
      expect(e.errorCode).toBe('alreadyOff');
    }
  });
});

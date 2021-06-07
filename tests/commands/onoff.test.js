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
});

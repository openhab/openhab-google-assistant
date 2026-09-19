const Command = require('../../functions/commands/brightnessabsolute.js');

describe('BrightnessAbsolute Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ brightness: 100 })).toBe(true);
    expect(Command.validateParams({ brightness: '100' })).toBe(false);
  });

  test('getItemName', () => {
    expect(Command.getItemName({ id: 'Item' })).toBe('Item');
    expect(Command.getItemName({ id: 'Item', customData: {} })).toBe('Item');
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

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue({ brightness: 0 })).toBe('0');
    expect(Command.convertParamsToValue({ brightness: 100 })).toBe('100');
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates({ brightness: 0 })).toStrictEqual({ brightness: 0 });
    expect(Command.getResponseStates({ brightness: 100 })).toStrictEqual({ brightness: 100 });
  });

  describe('checkCurrentState', () => {
    test('throws ALREADY_IN_STATE when brightness matches', () => {
      expect(() => {
        Command.checkCurrentState('50', '50', { brightness: 50 });
      }).toThrow('Brightness is already at 50%');
    });

    test('throws ALREADY_IN_STATE when within tolerance', () => {
      expect(() => {
        Command.checkCurrentState('50', '50.5', { brightness: 50 });
      }).toThrow('Brightness is already at 50%');
    });

    test('throws ALREADY_IN_STATE for fractional values within tolerance', () => {
      // parseInt would truncate 50.5/51.1 to 50/51 (diff 1, not within tolerance);
      // Number preserves the fractional diff of 0.6
      expect(() => {
        Command.checkCurrentState('50.5', '51.1', { brightness: 50 });
      }).toThrow('Brightness is already at 50%');
    });

    test('does not throw when brightness differs', () => {
      expect(() => {
        Command.checkCurrentState('50', '52', { brightness: 50 });
      }).not.toThrow();
    });

    test('does not throw for invalid values', () => {
      expect(() => {
        Command.checkCurrentState('invalid', 'NaN', { brightness: 50 });
      }).not.toThrow();
    });

    test('does not throw for null/empty state even when target is 0', () => {
      expect(() => {
        Command.checkCurrentState('0', null, { brightness: 0 });
      }).not.toThrow();
      expect(() => {
        Command.checkCurrentState('0', '', { brightness: 0 });
      }).not.toThrow();
    });
  });
});

const Command = require('../../functions/commands/setmodes.js');

describe('SetModes Command', () => {
  const params = { updateModeSettings: { mode: 'value' } };

  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams(params)).toBe(true);
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
      const device = {
        id: 'Item',
        customData: {
          deviceType: 'DynamicModesLight',
          members: {
            modesCurrentMode: 'CurrentMode'
          }
        }
      };
      expect(Command.getItemName(device)).toBe('CurrentMode');
    });

    test('getItemName Fan', () => {
      expect(() => {
        Command.getItemName({ name: 'Item', customData: { deviceType: 'Fan' } });
      }).toThrow();
      const device = {
        id: 'Item',
        customData: {
          deviceType: 'Fan',
          members: {
            fanMode: 'ModeItem'
          }
        }
      };
      expect(Command.getItemName(device)).toBe('ModeItem');
    });
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue(params)).toBe('value');
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates(params)).toStrictEqual({
      currentModeSettings: { mode: 'value' }
    });
  });
});

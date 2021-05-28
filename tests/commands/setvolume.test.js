const Command = require('../../functions/commands/setvolume.js');

describe('setVolume Command', () => {
  const params = { volumeLevel: 20 };

  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams(params)).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName', () => {
      expect(Command.getItemName({ id: 'Item' })).toBe('Item');
      expect(Command.getItemName({ id: 'Item', customData: {} })).toBe('Item');
    });

    test('getItemName TV', () => {
      expect(() => {
        Command.getItemName({ id: 'Item', customData: { deviceType: 'TV' } });
      }).toThrow();
      const device = {
        customData: {
          deviceType: 'TV',
          members: {
            tvVolume: 'VolumeItem'
          }
        }
      };
      expect(Command.getItemName(device)).toBe('VolumeItem');
    });
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue(params)).toBe('20');
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates(params)).toStrictEqual({ currentVolume: 20 });
  });
});

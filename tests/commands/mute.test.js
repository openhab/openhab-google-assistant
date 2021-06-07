const Command = require('../../functions/commands/mute.js');

describe('Mute Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ mute: true })).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName', () => {
      expect(Command.getItemName({ id: 'Item' })).toBe('Item');
      expect(Command.getItemName({ id: 'Item', customData: {} })).toBe('Item');
    });

    test('getItemName TV no members', () => {
      expect(() => {
        Command.getItemName({ id: 'Item', customData: { deviceType: 'TV' } });
      }).toThrow();
    });

    test('getItemName TV mute', () => {
      const device = {
        id: 'Item',
        customData: {
          deviceType: 'TV',
          members: {
            tvMute: 'MuteItem'
          }
        }
      };
      expect(Command.getItemName(device)).toBe('MuteItem');
    });

    test('getItemName TV volume', () => {
      const device = {
        id: 'Item',
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

  describe('convertParamsToValue', () => {
    test('convertParamsToValue no Switch', () => {
      expect(Command.convertParamsToValue({ mute: true }, {}, {})).toBe('0');
      expect(Command.convertParamsToValue({ mute: false }, {}, {})).toBeUndefined();
    });

    test('convertParamsToValue Switch', () => {
      expect(Command.convertParamsToValue({ mute: true }, {}, { customData: { itemType: 'Switch' } })).toBe('ON');
      expect(Command.convertParamsToValue({ mute: false }, {}, { customData: { itemType: 'Switch' } })).toBe('OFF');
    });

    test('convertParamsToValue inverted', () => {
      expect(
        Command.convertParamsToValue({ mute: true }, {}, { customData: { itemType: 'Switch', inverted: true } })
      ).toBe('OFF');
      expect(
        Command.convertParamsToValue({ mute: false }, {}, { customData: { itemType: 'Switch', inverted: true } })
      ).toBe('ON');
    });

    test('convertParamsToValue TV mute', () => {
      expect(
        Command.convertParamsToValue({ mute: true }, undefined, {
          customData: { deviceType: 'TV', members: { tvMute: 'MuteItem' } }
        })
      ).toBe('ON');
    });

    test('convertParamsToValue TV volume', () => {
      expect(
        Command.convertParamsToValue({ mute: true }, undefined, {
          customData: { deviceType: 'TV', members: { tvVolume: 'VolumeItem' } }
        })
      ).toBe('0');
    });
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates({ mute: true })).toStrictEqual({ isMuted: true });
    expect(Command.getResponseStates({ mute: false })).toStrictEqual({ isMuted: false });
  });
});

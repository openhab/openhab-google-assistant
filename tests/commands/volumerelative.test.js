const Command = require('../../functions/commands/volumerelative.js');

describe('volumeRelative Command', () => {
  const params = { relativeSteps: 10 };

  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams(params)).toBe(true);
  });

  test('requiresItem', () => {
    expect(Command.requiresItem()).toBe(true);
  });

  describe('getItemName', () => {
    test('getItemName', () => {
      expect(Command.getItemNameAndState({ name: 'Item' }, {})).toStrictEqual({ name: 'Item', state: undefined });
    });

    test('getItemName TV', () => {
      expect(() => {
        Command.getItemNameAndState({ name: 'Item' }, { customData: { deviceType: 'TV' } });
      }).toThrow();
      const item = {
        members: [
          {
            name: 'VolumeItem',
            state: '20',
            metadata: {
              ga: {
                value: 'tvVolume'
              }
            }
          }
        ]
      };
      expect(Command.getItemNameAndState(item, { customData: { deviceType: 'TV' } })).toStrictEqual({
        name: 'VolumeItem',
        state: '20'
      });
    });
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue', () => {
      expect(Command.convertParamsToValue(params, { state: 20 }, {})).toBe('30');
      expect(Command.convertParamsToValue({ relativeSteps: 90 }, { state: 20 }, {})).toBe('100');
      expect(Command.convertParamsToValue({ relativeSteps: -30 }, { state: 20 }, {})).toBe('0');
    });

    test('convertParamsToValue TV', () => {
      const item = {
        members: [
          {
            state: '20',
            metadata: {
              ga: {
                value: 'tvVolume'
              }
            }
          }
        ]
      };
      expect(Command.convertParamsToValue(params, item, { customData: { deviceType: 'TV' } })).toBe('30');
      expect(() => {
        Command.convertParamsToValue(params, {}, { customData: { deviceType: 'TV' } });
      }).toThrow();
    });
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates(params, { state: 20 }, {})).toStrictEqual({ currentVolume: 30 });
  });

  test('checkCurrentState', () => {
    expect.assertions(6);

    expect(Command.checkCurrentState('100', '10')).toBeUndefined();
    try {
      Command.checkCurrentState('100', '100');
    } catch (e) {
      expect(e.errorCode).toBe('volumeAlreadyMax');
    }

    expect(Command.checkCurrentState('0', '10')).toBeUndefined();
    try {
      Command.checkCurrentState('0', '0');
    } catch (e) {
      expect(e.errorCode).toBe('volumeAlreadyMin');
    }

    expect(Command.checkCurrentState('20', '40')).toBeUndefined();
    try {
      Command.checkCurrentState('20', '20');
    } catch (e) {
      expect(e.errorCode).toBe('alreadyInState');
    }
  });
});

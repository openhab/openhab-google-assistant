const Command = require('../../functions/commands/selectchannel.js');

describe('selectChannel Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ channelCode: 'channel1' })).toBe(true);
    expect(Command.validateParams({ channelName: 'Channel 1' })).toBe(true);
    expect(Command.validateParams({ channelNumber: '1' })).toBe(true);
  });

  test('requiresItem', () => {
    expect(Command.requiresItem()).toBe(true);
  });

  test('getItemName', () => {
    expect(() => {
      Command.getItemName({ name: 'Item' });
    }).toThrow();
    const item = {
      members: [
        {
          name: 'ChannelItem',
          metadata: {
            ga: {
              value: 'tvChannel'
            }
          }
        }
      ]
    };
    expect(Command.getItemName(item)).toBe('ChannelItem');
  });

  test('convertParamsToValue', () => {
    const item = {
      metadata: {
        ga: {
          config: {
            availableChannels: '1=channel1=ARD,2=channel2=ZDF'
          }
        }
      }
    };
    expect(Command.convertParamsToValue({ channelCode: 'channel1' }, item)).toBe('1');
    expect(Command.convertParamsToValue({ channelName: 'ARD' }, item)).toBe('1');
    expect(Command.convertParamsToValue({ channelNumber: '1' }, item)).toBe('1');
    expect(() => {
      Command.convertParamsToValue({ channelNumber: '0' }, item);
    }).toThrow();
    expect(() => {
      Command.convertParamsToValue({ channelName: 'wrong' }, item);
    }).toThrow();
  });

  test('getResponseStates', () => {
    const item = {
      metadata: {
        ga: {
          config: {
            availableChannels: '1=channel1=ARD,2=channel2=ZDF'
          }
        }
      }
    };
    expect(Command.getResponseStates({ channelName: 'ZDF' }, item)).toStrictEqual({ channelNumber: '2' });
  });
});

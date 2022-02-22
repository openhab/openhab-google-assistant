const Command = require('../../functions/commands/appselect.js');

describe('appSelect Command', () => {
  const paramsKey = { newApplication: 'netflix' };
  const paramsName = { newApplicationName: 'Net Flix' };

  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams(paramsKey)).toBe(true);
    expect(Command.validateParams(paramsName)).toBe(true);
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
          name: 'ApplicationItem',
          metadata: {
            ga: {
              value: 'tvApplication'
            }
          }
        }
      ]
    };
    expect(Command.getItemName(item)).toBe('ApplicationItem');
  });

  test('convertParamsToValue', () => {
    const item = {
      metadata: {
        ga: {
          config: {
            availableApplications: 'youtube=YouTube:Tube,netflix=Net Flix:Flix'
          }
        }
      }
    };
    expect(Command.convertParamsToValue(paramsKey, item)).toBe('netflix');
    expect(Command.convertParamsToValue(paramsName, item)).toBe('netflix');
    expect(Command.convertParamsToValue({ newApplicationName: 'Tube' }, item)).toBe('youtube');
    expect(() => {
      Command.convertParamsToValue({ newApplication: 'wrong' }, item);
    }).toThrow();
    expect(() => {
      Command.convertParamsToValue({ newApplicationName: 'wrong' }, item);
    }).toThrow();
  });

  test('getResponseStates', () => {
    const item = {
      metadata: {
        ga: {
          config: {
            availableApplications: 'youtube=YouTube,netflix=Net Flix'
          }
        }
      }
    };
    expect(Command.getResponseStates(paramsKey, item)).toStrictEqual({ currentApplication: 'netflix' });
    expect(Command.getResponseStates(paramsName, item)).toStrictEqual({ currentApplication: 'netflix' });
  });
});

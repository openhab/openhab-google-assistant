const Command = require('../../functions/commands/sethumidity.js');

describe('SetHumidity Command', () => {
  const params = { humidity: 65 };

  test('type', () => {
    expect(Command.type).toBe('action.devices.commands.SetHumidity');
  });

  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ humidity: 'invalid' })).toBe(false);
    expect(Command.validateParams(params)).toBe(true);
  });

  test('requiresItem', () => {
    // Group devices require item
    expect(Command.requiresItem({ customData: { deviceType: 'Humidifier', itemType: 'Group' } })).toBe(true);
    // Simple devices don't require item
    expect(Command.requiresItem({ customData: { deviceType: 'Humidifier', itemType: 'Dimmer' } })).toBe(false);
    expect(Command.requiresItem({ customData: { deviceType: 'Humidifier', itemType: 'Number' } })).toBe(false);
  });

  test('getItemName - Humidifier Group device', () => {
    const device = {
      customData: {
        deviceType: 'Humidifier',
        itemType: 'Group',
        members: {
          humidifierHumiditySetpoint: 'SetpointItem'
        }
      }
    };
    expect(Command.getItemName(device)).toBe('SetpointItem');
  });

  test('getItemName - missing member throws error', () => {
    const device = {
      customData: {
        deviceType: 'Humidifier',
        itemType: 'Group',
        members: {}
      }
    };
    expect(() => {
      Command.getItemName(device);
    }).toThrow();
  });

  test('getItemName - non-Group device', () => {
    const device = {
      id: 'HumidifierItem',
      customData: {
        deviceType: 'Humidifier',
        itemType: 'Dimmer'
      }
    };
    expect(Command.getItemName(device)).toBe('HumidifierItem');
  });

  test('convertParamsToValue - default config', () => {
    const device = { customData: {} };
    expect(Command.convertParamsToValue(params, {}, device)).toBe('65');
  });

  test('convertParamsToValue - with maxHumidity config', () => {
    const device = { customData: { maxHumidity: 1 } };
    // 65% of 1 = 0.65
    expect(Command.convertParamsToValue(params, {}, device)).toBe('0.65');
  });

  test('convertParamsToValue - with maxHumidity 50', () => {
    const device = { customData: { maxHumidity: 50 } };
    // 65% of 50 = 32.5
    expect(Command.convertParamsToValue({ humidity: 65 }, {}, device)).toBe('32.5');
  });

  test('convertParamsToValue - no customData', () => {
    const device = {};
    expect(Command.convertParamsToValue(params, {}, device)).toBe('65');
  });

  test('getResponseStates - Humidifier Group item', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'Power',
          type: 'Switch',
          state: 'ON',
          metadata: {
            ga: {
              value: 'humidifierPower'
            }
          }
        },
        {
          name: 'Setpoint',
          type: 'Number',
          state: '50',
          metadata: {
            ga: {
              value: 'humidifierHumiditySetpoint'
            }
          }
        }
      ]
    };
    const device = { customData: { deviceType: 'Humidifier', itemType: 'Group' } };
    const result = Command.getResponseStates(params, item, device);
    expect(result.humiditySetpointPercent).toBe(65);
    expect(result).toHaveProperty('on', true);
  });

  test('getResponseStates - Simple Dimmer device', () => {
    const device = { customData: { deviceType: 'Humidifier', itemType: 'Dimmer' } };
    const result = Command.getResponseStates(params, null, device);
    expect(result.humiditySetpointPercent).toBe(65);
    expect(result).toHaveProperty('on', true);
  });

  test('checkCurrentState - within tolerance', () => {
    expect(() => {
      Command.checkCurrentState('65', '64.5', params);
    }).toThrow();
  });

  test('checkCurrentState - outside tolerance', () => {
    expect(() => {
      Command.checkCurrentState('65', '60', params);
    }).not.toThrow();
  });

  test('checkCurrentState - exact match', () => {
    expect(() => {
      Command.checkCurrentState('65', '65', params);
    }).toThrow();
  });

  test('getResponseStates throws valueOutOfRange when below min', () => {
    const device = {
      customData: {
        deviceType: 'Humidifier',
        itemType: 'Dimmer',
        humiditySetpointRange: {
          minPercent: 30,
          maxPercent: 80
        }
      }
    };
    expect(() => {
      Command.getResponseStates({ humidity: 25 }, null, device);
    }).toThrow('Humidity 25% is below minimum 30%');
  });

  test('getResponseStates throws valueOutOfRange when above max', () => {
    const device = {
      customData: {
        deviceType: 'Humidifier',
        itemType: 'Dimmer',
        humiditySetpointRange: {
          minPercent: 30,
          maxPercent: 80
        }
      }
    };
    expect(() => {
      Command.getResponseStates({ humidity: 85 }, null, device);
    }).toThrow('Humidity 85% is above maximum 80%');
  });

  test('getResponseStates succeeds with valid range', () => {
    const device = {
      customData: {
        deviceType: 'Humidifier',
        itemType: 'Dimmer',
        humiditySetpointRange: {
          minPercent: 30,
          maxPercent: 80
        }
      }
    };
    const result = Command.getResponseStates({ humidity: 50 }, null, device);
    expect(result.humiditySetpointPercent).toBe(50);
    expect(result.on).toBe(true);
  });

  test('getResponseStates succeeds without range config', () => {
    const device = {
      customData: {
        deviceType: 'Humidifier',
        itemType: 'Dimmer'
      }
    };
    const result = Command.getResponseStates({ humidity: 95 }, null, device);
    expect(result.humiditySetpointPercent).toBe(95);
    expect(result.on).toBe(true);
  });
});

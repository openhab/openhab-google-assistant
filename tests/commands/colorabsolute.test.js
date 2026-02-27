const Command = require('../../functions/commands/colorabsolute.js');

describe('ColorAbsolute Command', () => {
  const params = {
    color: {
      spectrumHSV: { hue: 10, saturation: 0.2, value: 0.3 }
    }
  };

  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(false);
    expect(Command.validateParams({ color: {} })).toBe(false);
    expect(Command.validateParams(params)).toBe(true);

    // Test invalid hue values
    expect(Command.validateParams({ color: { spectrumHSV: { hue: -1, saturation: 0.5, value: 0.5 } } })).toBe(false);
    expect(Command.validateParams({ color: { spectrumHSV: { hue: 361, saturation: 0.5, value: 0.5 } } })).toBe(false);
    expect(Command.validateParams({ color: { spectrumHSV: { hue: 'invalid', saturation: 0.5, value: 0.5 } } })).toBe(
      false
    );

    // Test invalid saturation values
    expect(Command.validateParams({ color: { spectrumHSV: { hue: 180, saturation: -0.1, value: 0.5 } } })).toBe(false);
    expect(Command.validateParams({ color: { spectrumHSV: { hue: 180, saturation: 1.1, value: 0.5 } } })).toBe(false);
    expect(Command.validateParams({ color: { spectrumHSV: { hue: 180, saturation: 'invalid', value: 0.5 } } })).toBe(
      false
    );

    // Test invalid value values
    expect(Command.validateParams({ color: { spectrumHSV: { hue: 180, saturation: 0.5, value: -0.1 } } })).toBe(false);
    expect(Command.validateParams({ color: { spectrumHSV: { hue: 180, saturation: 0.5, value: 1.1 } } })).toBe(false);
    expect(Command.validateParams({ color: { spectrumHSV: { hue: 180, saturation: 0.5, value: 'invalid' } } })).toBe(
      false
    );

    // Test valid boundary values
    expect(Command.validateParams({ color: { spectrumHSV: { hue: 0, saturation: 0, value: 0 } } })).toBe(true);
    expect(Command.validateParams({ color: { spectrumHSV: { hue: 360, saturation: 1, value: 1 } } })).toBe(true);
  });

  test('getItemName', () => {
    expect(Command.getItemName({ id: 'Item' })).toBe('Item');
    expect(Command.getItemName({ id: 'Item' }, {})).toBe('Item');
    expect(Command.getItemName({ id: 'Item' }, { customData: {} })).toBe('Item');
    expect(Command.getItemName({ id: 'Item' }, { customData: { deviceType: 'ColorLight' } })).toBe('Item');
    expect(() => {
      Command.getItemName({ id: 'Item', customData: { deviceType: 'SpecialColorLight' } });
    }).toThrow();
    expect(
      Command.getItemName({
        id: 'Item',
        customData: {
          deviceType: 'SpecialColorLight',
          members: {
            lightColor: 'ColorItem'
          }
        }
      })
    ).toBe('ColorItem');
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue(params, {}, { customData: { deviceType: 'ColorLight' } })).toBe('10,20,30');
    expect(Command.convertParamsToValue(params, {}, { customData: { deviceType: 'SpecialColorLight' } })).toBe(
      '10,20,30'
    );
    expect(() => Command.convertParamsToValue(params, {}, { customData: { deviceType: 'Light' } })).toThrow();
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates(params)).toStrictEqual({
      color: {
        spectrumHsv: { hue: 10, saturation: 0.2, value: 0.3 }
      }
    });
  });
});

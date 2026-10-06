const { DEVICE_REGISTRY } = require('../../functions/deviceRegistry.js');

const Device = DEVICE_REGISTRY.find((d) => d.name === 'SimplePressureCooker');

describe('SimplePressureCooker Device', () => {
  test('device exists in registry', () => {
    expect(Device).toBeDefined();
    expect(Device.name).toBe('SimplePressureCooker');
  });

  test('matchesDeviceType', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'PRESSURECOOKER'
          }
        }
      })
    ).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ type: 'Switch' })).toBe(true);
    expect(Device.matchesItemType({ type: 'String' })).toBe(false);
  });

  test('getMetadata includes deviceType', () => {
    const metadata = Device.getMetadata({
      type: 'Switch',
      name: 'PressureCookerPower',
      label: 'Pressure Cooker Power',
      metadata: { ga: { value: 'PRESSURECOOKER' } }
    });
    expect(metadata.customData.deviceType).toBe('SimplePressureCooker');
    expect(metadata.type).toBe('action.devices.types.PRESSURECOOKER');
    expect(metadata.traits).toStrictEqual(['action.devices.traits.OnOff']);
  });

  test('getState respects inverted', () => {
    expect(
      Device.getState({
        state: 'ON',
        metadata: { ga: { value: 'PRESSURECOOKER' } }
      })
    ).toStrictEqual({ on: true });

    expect(
      Device.getState({
        state: 'ON',
        metadata: { ga: { value: 'PRESSURECOOKER', config: { inverted: true } } }
      })
    ).toStrictEqual({ on: false });
  });
});

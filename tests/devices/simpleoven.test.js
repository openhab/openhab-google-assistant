const { DEVICE_REGISTRY } = require('../../functions/deviceRegistry.js');

const Device = DEVICE_REGISTRY.find((d) => d.name === 'SimpleOven');

describe('SimpleOven Device', () => {
  test('device exists in registry', () => {
    expect(Device).toBeDefined();
    expect(Device.name).toBe('SimpleOven');
  });

  test('matchesDeviceType', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'OVEN'
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
      name: 'OvenPower',
      label: 'Oven Power',
      metadata: { ga: { value: 'OVEN' } }
    });
    expect(metadata.customData.deviceType).toBe('SimpleOven');
    expect(metadata.type).toBe('action.devices.types.OVEN');
    expect(metadata.traits).toStrictEqual(['action.devices.traits.OnOff']);
  });

  test('getState respects inverted', () => {
    expect(
      Device.getState({
        state: 'ON',
        metadata: { ga: { value: 'OVEN' } }
      })
    ).toStrictEqual({ on: true });

    expect(
      Device.getState({
        state: 'ON',
        metadata: { ga: { value: 'OVEN', config: { inverted: true } } }
      })
    ).toStrictEqual({ on: false });
  });
});

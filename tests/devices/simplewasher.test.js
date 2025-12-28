const { DEVICE_REGISTRY } = require('../../functions/deviceRegistry.js');

const Device = DEVICE_REGISTRY.find((d) => d.name === 'SimpleWasher');

describe('SimpleWasher Device', () => {
  test('device exists in registry', () => {
    expect(Device).toBeDefined();
    expect(Device.name).toBe('SimpleWasher');
  });

  test('matchesDeviceType', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'WASHER'
          }
        }
      })
    ).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ type: 'Switch' })).toBe(true);
    expect(Device.matchesItemType({ type: 'String' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Switch' })).toBe(true);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'String' })).toBe(false);
  });

  test('getMetadata includes deviceType', () => {
    const metadata = Device.getMetadata({
      type: 'Switch',
      name: 'WasherPower',
      label: 'Washer Power',
      metadata: { ga: { value: 'WASHER' } }
    });
    expect(metadata.customData.deviceType).toBe('SimpleWasher');
    expect(metadata.type).toBe('action.devices.types.WASHER');
  });

  test('getState respects inverted', () => {
    expect(
      Device.getState({
        state: 'ON',
        metadata: { ga: { value: 'WASHER' } }
      })
    ).toStrictEqual({ isRunning: true });

    expect(
      Device.getState({
        state: 'ON',
        metadata: { ga: { value: 'WASHER', config: { inverted: true } } }
      })
    ).toStrictEqual({ isRunning: false });
  });
});

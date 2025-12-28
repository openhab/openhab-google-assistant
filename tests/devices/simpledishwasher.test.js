const { DEVICE_REGISTRY } = require('../../functions/deviceRegistry.js');

const Device = DEVICE_REGISTRY.find((d) => d.name === 'SimpleDishwasher');

describe('SimpleDishwasher Device', () => {
  test('device exists in registry', () => {
    expect(Device).toBeDefined();
    expect(Device.name).toBe('SimpleDishwasher');
  });

  test('matchesDeviceType', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'DISHWASHER'
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
      name: 'DishwasherPower',
      label: 'Dishwasher Power',
      metadata: { ga: { value: 'DISHWASHER' } }
    });
    expect(metadata.customData.deviceType).toBe('SimpleDishwasher');
    expect(metadata.type).toBe('action.devices.types.DISHWASHER');
  });

  test('getState respects inverted', () => {
    expect(
      Device.getState({
        state: 'ON',
        metadata: { ga: { value: 'DISHWASHER' } }
      })
    ).toStrictEqual({ isRunning: true });

    expect(
      Device.getState({
        state: 'ON',
        metadata: { ga: { value: 'DISHWASHER', config: { inverted: true } } }
      })
    ).toStrictEqual({ isRunning: false });
  });
});

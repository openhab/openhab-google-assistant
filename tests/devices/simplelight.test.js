const { DEVICE_REGISTRY } = require('../../functions/devices/registry.js');

// Find SimpleLight in the registry
const Device = DEVICE_REGISTRY.find((d) => d.name === 'SimpleLight');

describe('SimpleLight Device', () => {
  test('device exists in registry', () => {
    expect(Device).toBeDefined();
    expect(Device.name).toBe('SimpleLight');
  });

  test('matchesDeviceType', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'LIGHT'
          }
        }
      })
    ).toBe(true);
  });
});

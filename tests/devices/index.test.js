const getDeviceForItem = require('../../functions/devices/index.js').getDeviceForItem;

describe('Devices Index', () => {
  test('getDeviceForItem', () => {
    const device = getDeviceForItem({ type: 'Switch', metadata: { ga: { value: 'Switch' } } });
    expect(device).not.toBeUndefined();
    expect(device.name).toBe('Switch');
  });
});

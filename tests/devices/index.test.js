const findDeviceType = require('../../functions/deviceMatcher.js').findDeviceType;

describe('Device Matcher', () => {
  test('findDeviceType', () => {
    const device = findDeviceType({ type: 'Switch', metadata: { ga: { value: 'Switch' } } });
    expect(device).not.toBeUndefined();
    expect(device.name).toBe('Switch');
  });
});

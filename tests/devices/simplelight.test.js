const Device = require('../../functions/devices/simplelight.js');

describe('SimpleLight Device', () => {
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

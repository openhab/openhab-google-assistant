const Device = require('../../functions/devices/modeslight.js');

describe('ModesLight Device', () => {
  test('matchesDeviceType', () => {
    expect(Device.matchesDeviceType({ type: 'Group' })).toBe(false);
    expect(
      Device.matchesDeviceType({
        type: 'Switch',
        metadata: {
          ga: {
            value: 'light',
            config: {}
          }
        }
      })
    ).toBe(false);
    expect(
      Device.matchesDeviceType({
        type: 'Switch',
        metadata: {
          ga: {
            value: 'light',
            config: {
              mode: 'testMode',
              settings: '1=test'
            }
          }
        }
      })
    ).toBe(true);
  });
});

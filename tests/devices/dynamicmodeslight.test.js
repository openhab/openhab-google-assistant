const Device = require('../../functions/devices/dynamicmodeslight.js');

describe('DynamicModesLight Device', () => {
  const item = {
    type: 'Group',
    metadata: {
      ga: {
        value: 'light',
        config: {
          mode: 'mode_name,alternate_mode_name',
          ordered: true
        }
      }
    },
    members: [
      {
        name: 'CurrentMode',
        state: 'mode_value',
        type: 'String',
        metadata: {
          ga: {
            value: 'modesCurrentMode'
          }
        }
      },
      {
        name: 'Settings',
        state: 'setting1=mode_value:alternate_mode_value,setting2=mode_value2',
        type: 'String',
        metadata: {
          ga: {
            value: 'modesSettings'
          }
        }
      }
    ]
  };

  test('matchesDeviceType', () => {
    expect(Device.matchesDeviceType(item)).toBe(true);
    expect(Device.matchesDeviceType({ metadata: { ga: { value: 'test' } } })).toBe(false);
    expect(Device.matchesDeviceType({ metadata: { ga: { value: 'light' } } })).toBe(false);
  });
});

const Device = require('../../functions/devices/dynamicmodesdevice.js');

describe('DynamicModesDevice Device', () => {
  const item = {
    type: 'Group',
    metadata: {
      ga: {
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

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ type: 'Color' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Color' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Dimmer' })).toBe(false);
  });

  describe('getAttributes', () => {
    test('getAttributes no config', () => {
      const invalid_item = {
        metadata: {
          ga: {
            config: {}
          }
        }
      };
      expect(Device.getAttributes(invalid_item)).toStrictEqual({});
    });

    test('getAttributes mode', () => {
      expect(Device.getAttributes(item)).toStrictEqual({
        availableModes: [
          {
            name: 'mode_name',
            name_values: [
              {
                lang: 'en',
                name_synonym: ['mode_name', 'alternate_mode_name']
              }
            ],
            ordered: true,
            settings: [
              {
                setting_name: 'setting1',
                setting_values: [
                  {
                    lang: 'en',
                    setting_synonym: ['setting1', 'mode_value', 'alternate_mode_value']
                  }
                ]
              },
              {
                setting_name: 'setting2',
                setting_values: [
                  {
                    lang: 'en',
                    setting_synonym: ['setting2', 'mode_value2']
                  }
                ]
              }
            ]
          }
        ]
      });
    });
  });

  test('getState', () => {
    expect(Device.getState(item)).toStrictEqual({
      currentModeSettings: {
        mode_name: 'mode_value'
      }
    });
  });
});

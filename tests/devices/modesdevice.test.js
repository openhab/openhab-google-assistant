const Device = require('../../functions/devices/modesdevice.js');

describe('ModesDevice Device', () => {
  test('matchesItemType', () => {
    expect(Device.matchesItemType({ "type": "Group", "groupType": "None" })).toBe(false);
    expect(Device.matchesItemType({
      "type": "Switch",
      "metadata": {
        "ga": {
          "value": "light",
          "config": {}
        }
      }
    })).toBe(false);
    expect(Device.matchesItemType({
      "type": "Switch",
      "metadata": {
        "ga": {
          "value": "light",
          "config": {
            "mode": "testMode",
            "settings": "1=test"
          }
        }
      }
    })).toBe(true);
  });

  describe('getAttributes', () => {
    test('getAttributes no config', () => {
      const item = {
        "metadata": {
          "ga": {
            "config": {}
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({});
    });

    test('getAttributes mode', () => {
      const item = {
        "metadata": {
          "ga": {
            "config": {
              "mode": "mode_name,alternate_mode_name",
              "settings": "setting1=mode_value:alternate_mode_value,setting2=mode_value2",
              "ordered": true
            }
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        "availableModes": [
          {
            "name": "mode_name",
            "name_values": [
              {
                "lang": "en",
                "name_synonym": ["mode_name", "alternate_mode_name"]
              }
            ],
            "ordered": true,
            "settings": [
              {
                "setting_name": "setting1",
                "setting_values": [
                  {
                    "lang": "en",
                    "setting_synonym": [
                      "setting1",
                      "mode_value",
                      "alternate_mode_value"
                    ]
                  }
                ]
              },
              {
                "setting_name": "setting2",
                "setting_values": [
                  {
                    "lang": "en",
                    "setting_synonym": [
                      "setting2",
                      "mode_value2"
                    ]
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
    expect(Device.getState({ "state": "mode_value" })).toStrictEqual({});
    expect(Device.getState({
      "state": "mode_value",
      "metadata": {
        "ga": {
          "config": {
            "mode": "mode_name,alternate_mode_name",
            "settings": "setting1=mode_value:alternate_mode_value,setting2=mode_value2"
          }
        }
      }
    })).toStrictEqual({
      "currentModeSettings": {
        "mode_name": "mode_value"
      }
    });
  });
});

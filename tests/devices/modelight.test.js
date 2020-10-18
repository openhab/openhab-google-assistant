const Device = require('../../functions/devices/modelight.js');

describe('ModeLight Device', () => {
  test('isCompatible', () => {
    expect(Device.isCompatible({
      "metadata": {
        "ga": {
          "value": "LIGHT"
        }
      }
    })).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ "type": "String" })).toBe(true);
    expect(Device.matchesItemType({ "type": "Dimmer" })).toBe(false);
    expect(Device.matchesItemType({ "type": "Group", "groupType": "String" })).toBe(true);
    expect(Device.matchesItemType({ "type": "Group", "groupType": "Dimmer" })).toBe(false);
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
              "modes": {
                "name": "mode_name",
                "settings": {
                  "setting1": "mode_value"
                }
              }
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
                "name_synonym": ["mode_name"]
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
                      "mode_value"
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
            "modes": {
              "name": "mode_name",
              "settings": {
                "setting1": "mode_value"
              }
            }
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

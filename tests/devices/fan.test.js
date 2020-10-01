const Device = require('../../functions/devices/fan.js');

describe('Fan Device', () => {
  test('isCompatible', () => {
    expect(Device.isCompatible({
      "metadata": {
        "ga": {
          "value": "FAN"
        }
      }
    })).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ "type": "Dimmer" })).toBe(true);
    expect(Device.matchesItemType({ "type": "String" })).toBe(false);
    expect(Device.matchesItemType({ "type": "Group", "groupType": "Dimmer" })).toBe(true);
    expect(Device.matchesItemType({ "type": "Group", "groupType": "String" })).toBe(false);
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

    test('getAttributes speeds', () => {
      const item = {
        "metadata": {
          "ga": {
            "config": {
              "ordered": true,
              "speeds": "0=null:off,50=slow,100=full:fast",
              "lang": "en"
            }
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        "availableFanSpeeds": {
          "speeds": [
            {
              "speed_name": "0",
              "speed_values": [
                {
                  "speed_synonym": ["null", "off"],
                  "lang": "en"
                }
              ]
            },
            {
              "speed_name": "50",
              "speed_values": [
                {
                  "speed_synonym": ["slow"],
                  "lang": "en"
                }
              ]
            },
            {
              "speed_name": "100",
              "speed_values": [
                {
                  "speed_synonym": ["full", "fast"],
                  "lang": "en"
                }
              ]
            }
          ],
          "ordered": true
        },
        "reversible": false
      });
    });
  });

  test('getState', () => {
    expect(Device.getState({ "state": "50" })).toStrictEqual({
      "currentFanSpeedSetting": "50",
      "on": true
    });
  });
});

const Device = require('../../functions/devices/fan.js');

describe('Test Fan Device', () => {
  test('Test isCompatible', async () => {
    expect(Device.isCompatible({
      "metadata": {
        "ga": {
          "value": "FAN"
        }
      }
    })).toBe(true);
    expect(Device.isCompatible({
      "metadata": {
        "ga": {
          "value": "SOMETHING"
        }
      }
    })).toBe(false);
  });

  test('Test matchesItemType', async () => {
    expect(Device.matchesItemType({ "type": "Dimmer" })).toBe(true);
    expect(Device.matchesItemType({ "type": "String" })).toBe(false);
    expect(Device.matchesItemType({ "type": "Group", "groupType": "Dimmer" })).toBe(true);
    expect(Device.matchesItemType({ "type": "Group", "groupType": "String" })).toBe(false);
  });

  test('Test getAttributes', async () => {
    const item1 = {
      "metadata": {
        "ga": {
          "config": {}
        }
      }
    };
    expect(Device.getAttributes(item1)).toStrictEqual({});

    const item2 = {
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
    expect(Device.getAttributes(item2)).toStrictEqual({
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

  test('Test getState', async () => {
    const item = {
      "state": "50"
    };
    expect(Device.getState(item)).toStrictEqual({
      "currentFanSpeedSetting": "50",
      "on": true
    });
  });
});

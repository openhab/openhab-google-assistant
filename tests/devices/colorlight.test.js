const Device = require('../../functions/devices/colorlight.js');

describe('Test ColorLight Device', () => {
  test('Test isCompatible', async () => {
    expect(Device.isCompatible({
      "metadata": {
        "ga": {
          "value": "LIGHT"
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
    expect(Device.matchesItemType({ "type": "Color" })).toBe(true);
    expect(Device.matchesItemType({ "type": "Dimmer" })).toBe(false);
    expect(Device.matchesItemType({ "type": "Group", "groupType": "Color" })).toBe(true);
    expect(Device.matchesItemType({ "type": "Group", "groupType": "Dimmer" })).toBe(false);
  });

  test('Test getAttributes', async () => {
    const item1 = {
      "metadata": {
        "ga": {
          "config": {
            "colorTemperatureRange": "a,b"
          }
        }
      }
    };
    expect(Device.getAttributes(item1)).toStrictEqual({
      "colorModel": "hsv"
    });

    const item2 = {
      "metadata": {
        "ga": {
          "config": {
            "colorTemperatureRange": "1000,2000"
          }
        }
      }
    };
    expect(Device.getAttributes(item2)).toStrictEqual({
      "colorModel": "hsv",
      "colorTemperatureRange": {
        "temperatureMinK": 1000,
        "temperatureMaxK": 2000
      }
    });
  });

  test('Test getState', async () => {
    expect(Device.getState({ "state": "100,50,10" })).toStrictEqual({
      "on": true,
      "brightness": 10,
      "color": {
        "spectrumHSV": {
          "hue": 100,
          "saturation": 0.5,
          "value": 0.1
        }
      }
    });
  });
});

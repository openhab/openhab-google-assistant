const Device = require('../../functions/devices/speaker.js');

describe('Speaker Device', () => {
  test('isCompatible', () => {
    expect(Device.isCompatible({
      "metadata": {
        "ga": {
          "value": "SPEAKER"
        }
      }
    })).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ "type": "Dimmer" })).toBe(true);
    expect(Device.matchesItemType({ "type": "Number" })).toBe(false);
    expect(Device.matchesItemType({ "type": "Group", "groupType": "Dimmer" })).toBe(true);
    expect(Device.matchesItemType({ "type": "Group", "groupType": "Number" })).toBe(false);
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
      expect(Device.getAttributes(item)).toStrictEqual({
        "volumeCanMuteAndUnmute": false,
        "volumeMaxLevel": 100
      });
    });

    test('getAttributes volumeDefaultPercentage, levelStepSize', () => {
      const item = {
        "metadata": {
          "ga": {
            "config": {
              "volumeDefaultPercentage": "20",
              "levelStepSize": "10"
            }
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        "volumeCanMuteAndUnmute": false,
        "volumeMaxLevel": 100,
        "volumeDefaultPercentage": 20,
        "levelStepSize": 10
      });
    });
  });

  test('getState', () => {
    expect(Device.getState({ "state": "10" })).toStrictEqual({
      "currentVolume": 10
    });
    expect(Device.getState({ "state": "90" })).toStrictEqual({
      "currentVolume": 90
    });
  });
});

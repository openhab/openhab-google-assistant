const Device = require('../../functions/devices/startstopswitch.js');

describe('StartStopSwitch Device', () => {
  test('matchesItemType', () => {
    expect(Device.matchesItemType({ "type": "Switch" })).toBe(true);
    expect(Device.matchesItemType({ "type": "Dimmer" })).toBe(false);
    expect(Device.matchesItemType({ "type": "Group", "groupType": "Switch" })).toBe(true);
    expect(Device.matchesItemType({ "type": "Group", "groupType": "Dimmer" })).toBe(false);
  });

  test('getAttributes', () => {
    expect(Device.getAttributes()).toStrictEqual({ "pausable": false });
  });

  describe('getState', () => {
    test('getState', () => {
      expect(Device.getState({ "state": "ON" })).toStrictEqual({
        "isRunning": true,
        "isPaused": false
      });
      expect(Device.getState({ "state": "OFF" })).toStrictEqual({
        "isRunning": false,
        "isPaused": true
      });
    });

    test('getState inverted', () => {
      const item = {
        "state": "ON",
        "metadata": {
          "ga": {
            "config": {
              "inverted": true
            }
          }
        }
      };
      expect(Device.getState(item)).toStrictEqual({
        "isRunning": false,
        "isPaused": true
      });
      item.state = "OFF";
      expect(Device.getState(item)).toStrictEqual({
        "isRunning": true,
        "isPaused": false
      });
    });
  });
});

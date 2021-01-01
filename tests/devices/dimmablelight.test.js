const Device = require('../../functions/devices/dimmablelight.js');

describe('DimmableLight Device', () => {
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
    expect(Device.matchesItemType({ "type": "Dimmer" })).toBe(true);
    expect(Device.matchesItemType({ "type": "String" })).toBe(false);
    expect(Device.matchesItemType({ "type": "Group", "groupType": "Dimmer" })).toBe(true);
    expect(Device.matchesItemType({ "type": "Group", "groupType": "String" })).toBe(false);
  });

  test('getState', () => {
    expect(Device.getState({ "state": "50" })).toStrictEqual({
      "on": true,
      "brightness": 50
    });
    expect(Device.getState({ "state": "NULL" })).toStrictEqual({
      "on": false,
      "brightness": 0
    });
  });
});

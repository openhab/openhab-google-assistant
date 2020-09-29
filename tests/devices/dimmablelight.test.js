const Device = require('../../functions/devices/dimmablelight.js');

describe('Test DimmableLight Device', () => {
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
    expect(Device.matchesItemType({ "type": "Dimmer" })).toBe(true);
    expect(Device.matchesItemType({ "type": "String" })).toBe(false);
    expect(Device.matchesItemType({ "type": "Group", "groupType": "Dimmer" })).toBe(true);
    expect(Device.matchesItemType({ "type": "Group", "groupType": "String" })).toBe(false);
  });

  test('Test getState', async () => {
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

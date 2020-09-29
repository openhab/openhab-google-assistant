const Device = require('../../functions/devices/switch.js');

describe('Test Switch Device', () => {
  test('Test isCompatible', async () => {
    expect(Device.isCompatible({
      "metadata": {
        "ga": {
          "value": "SWITCH"
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
    expect(Device.matchesItemType({ "type": "Switch" })).toBe(true);
    expect(Device.matchesItemType({ "type": "String" })).toBe(false);
    expect(Device.matchesItemType({ "type": "Group", "groupType": "Switch" })).toBe(true);
    expect(Device.matchesItemType({ "type": "Group", "groupType": "String" })).toBe(false);
  });

  test('Test getState', async () => {
    expect(Device.getState({ "state": "ON" })).toStrictEqual({
      "on": true
    });
    expect(Device.getState({ "state": "OFF" })).toStrictEqual({
      "on": false
    });
  });

  test('Test getState inverted', async () => {
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
      "on": false
    });
  });
});

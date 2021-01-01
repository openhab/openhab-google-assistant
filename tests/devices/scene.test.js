const Device = require('../../functions/devices/scene.js');

describe('Scene Device', () => {
  test('isCompatible', () => {
    expect(Device.isCompatible({
      "metadata": {
        "ga": {
          "value": "SCENE"
        }
      }
    })).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ "type": "Switch" })).toBe(true);
    expect(Device.matchesItemType({ "type": "String" })).toBe(false);
    expect(Device.matchesItemType({ "type": "Group", "groupType": "Switch" })).toBe(true);
    expect(Device.matchesItemType({ "type": "Group", "groupType": "String" })).toBe(false);
  });

  test('getAttributes', () => {
    expect(Device.getAttributes()).toStrictEqual({
      "sceneReversible": true
    });
  });

  test('getState', () => {
    expect(Device.getState({})).toStrictEqual({});
  });
});

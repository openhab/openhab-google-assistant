const Device = require('../../functions/devices/scene.js');

describe('Scene Device', () => {
  test('matchesDeviceType', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'SCENE'
          }
        }
      })
    ).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ type: 'Switch' })).toBe(true);
    expect(Device.matchesItemType({ type: 'String' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Switch' })).toBe(true);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'String' })).toBe(false);
  });

  describe('getAttributes', () => {
    test('getAttributes no config', () => {
      expect(Device.getAttributes()).toStrictEqual({
        sceneReversible: true
      });
    });

    test('getAttributes with sceneReversible = true', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              sceneReversible: true
            }
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        sceneReversible: true
      });
    });

    test('getAttributes with sceneReversible = false', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              sceneReversible: false
            }
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        sceneReversible: false
      });
    });
  });

  test('getState', () => {
    expect(Device.getState({})).toStrictEqual({});
  });
});

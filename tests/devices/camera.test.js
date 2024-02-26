const Device = require('../../functions/devices/camera.js');

describe('Camera Device', () => {
  test('matchesDeviceType', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'CAMERA'
          }
        }
      })
    ).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ type: 'String' })).toBe(true);
    expect(Device.matchesItemType({ type: 'Number' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'String' })).toBe(true);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Number' })).toBe(false);
  });

  describe('getAttributes', () => {
    test('getAttributes no config', () => {
      const item = {
        metadata: {
          ga: {
            config: {}
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        cameraStreamSupportedProtocols: ['hls', 'dash', 'smooth_stream', 'progressive_mp4'],
        cameraStreamNeedAuthToken: false,
        cameraStreamNeedDrmEncryption: false
      });
    });

    test('getAttributes protocols, token', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              protocols: 'hls,test',
              token: true
            }
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        cameraStreamSupportedProtocols: ['hls', 'test'],
        cameraStreamNeedAuthToken: true,
        cameraStreamNeedDrmEncryption: false
      });
    });
  });

  test('getState', () => {
    expect(Device.getState({})).toStrictEqual({});
  });
});

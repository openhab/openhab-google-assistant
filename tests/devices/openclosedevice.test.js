const Device = require('../../functions/devices/openclosedevice.js');

describe('OpenCloseDevice Device', () => {
  test('getAttributes', () => {
    expect(Device.getAttributes({ type: 'Rollershutter' })).toStrictEqual({
      pausable: false,
      discreteOnlyOpenClose: false,
      queryOnlyOpenClose: false
    });
    expect(
      Device.getAttributes({
        type: 'Rollershutter',
        metadata: {
          ga: {
            config: {
              discreteOnly: true,
              queryOnly: true
            }
          }
        }
      })
    ).toStrictEqual({
      pausable: false,
      discreteOnlyOpenClose: true,
      queryOnlyOpenClose: true
    });
    expect(Device.getAttributes({ type: 'Switch' })).toStrictEqual({
      pausable: false,
      discreteOnlyOpenClose: true,
      queryOnlyOpenClose: false
    });
    expect(Device.getAttributes({ type: 'Contact' })).toStrictEqual({
      pausable: false,
      discreteOnlyOpenClose: true,
      queryOnlyOpenClose: true
    });

    expect(Device.getAttributes({ type: 'Group' })).toStrictEqual({
      pausable: false,
      discreteOnlyOpenClose: false,
      queryOnlyOpenClose: false
    });
    expect(Device.getAttributes({ type: 'Group', groupType: 'Switch' })).toStrictEqual({
      pausable: false,
      discreteOnlyOpenClose: true,
      queryOnlyOpenClose: false
    });
    expect(Device.getAttributes({ type: 'Group', groupType: 'Contact' })).toStrictEqual({
      pausable: false,
      discreteOnlyOpenClose: true,
      queryOnlyOpenClose: true
    });
  });

  describe('getState', () => {
    test('getState Contact', () => {
      const item = {
        type: 'Contact',
        state: 'OPEN'
      };
      expect(Device.getState(item)).toStrictEqual({
        openPercent: 100
      });
      item.state = 'CLOSED';
      expect(Device.getState(item)).toStrictEqual({
        openPercent: 0
      });
    });

    test('getState Switch', () => {
      const item = {
        type: 'Switch',
        state: 'ON'
      };
      expect(Device.getState(item)).toStrictEqual({
        openPercent: 100
      });
      item.state = 'OFF';
      expect(Device.getState(item)).toStrictEqual({
        openPercent: 0
      });
    });

    test('getState Rollershutter', () => {
      const item = {
        type: 'Rollershutter',
        state: '25'
      };
      expect(Device.getState(item)).toStrictEqual({
        openPercent: 75
      });
    });

    test('getState Group Rollershutter', () => {
      const item = {
        type: 'Group',
        groupType: 'Rollershutter',
        state: '25'
      };
      expect(Device.getState(item)).toStrictEqual({
        openPercent: 75
      });
    });

    test('getState inverted Contact', () => {
      const item = {
        type: 'Contact',
        state: 'CLOSED',
        metadata: {
          ga: {
            config: {
              inverted: true
            }
          }
        }
      };
      expect(Device.getState(item)).toStrictEqual({
        openPercent: 100
      });
    });

    test('getState inverted Switch', () => {
      const item = {
        type: 'Switch',
        state: 'ON',
        metadata: {
          ga: {
            config: {
              inverted: true
            }
          }
        }
      };
      expect(Device.getState(item)).toStrictEqual({
        openPercent: 0
      });
    });

    test('getState inverted Rollershutter', () => {
      const item = {
        type: 'Rollershutter',
        state: '25',
        metadata: {
          ga: {
            config: {
              inverted: true
            }
          }
        }
      };
      expect(Device.getState(item)).toStrictEqual({
        openPercent: 25
      });
    });
  });
});

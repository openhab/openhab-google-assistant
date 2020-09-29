const Device = require('../../functions/devices/openclosedevice.js');

describe('Test OpenCloseDevice Device', () => {
  test('Test getAttributes', async () => {
    expect(Device.getAttributes({ "type": "Rollershutter" })).toStrictEqual({
      "discreteOnlyOpenClose": false,
      "queryOnlyOpenClose": false
    });
    expect(Device.getAttributes({ "type": "Switch", })).toStrictEqual({
      "discreteOnlyOpenClose": true,
      "queryOnlyOpenClose": false
    });
    expect(Device.getAttributes({ "type": "Contact" })).toStrictEqual({
      "discreteOnlyOpenClose": true,
      "queryOnlyOpenClose": true
    });
  });

  test('Test getState', async () => {
    const item1 = {
      "type": "Switch",
      "state": "ON"
    };
    expect(Device.getState(item1)).toStrictEqual({
      "openPercent": 100
    });
    const item2 = {
      "type": "Rollershutter",
      "state": "25"
    };
    expect(Device.getState(item2)).toStrictEqual({
      "openPercent": 75
    });
  });

  test('Test getState inverted', async () => {
    const item = {
      "type": "Switch",
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
      "openPercent": 0
    });
    const item2 = {
      "type": "Rollershutter",
      "state": "25",
      "metadata": {
        "ga": {
          "config": {
            "inverted": true
          }
        }
      }
    };
    expect(Device.getState(item2)).toStrictEqual({
      "openPercent": 25
    });
  });
});

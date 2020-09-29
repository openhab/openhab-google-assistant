const Device = require('../../functions/devices/simplelight.js');

describe('Test SimpleLight Device', () => {
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
});

const Device = require('../../functions/devices/simplelight.js');

describe('SimpleLight Device', () => {
  test('isCompatible', () => {
    expect(Device.isCompatible({
      "metadata": {
        "ga": {
          "value": "LIGHT"
        }
      }
    })).toBe(true);
  });
});

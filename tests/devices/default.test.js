const Device = require('../../functions/devices/default.js');

describe('Fan Device', () => {
  const item = {
    "type": "Number",
    "state": "50",
    "name": "DefaultDevice",
    "label": "Default Device",
    "metadata": {
      "ga": {
        "value": "",
        "config": {
          "inverted": true,
          "ackNeeded": true,
          "pinNeeded": "1234"
        }
      },
      "synonyms":  {
        "value": "Standard Device"
      }
    }
  };

  test('getConfig', () => {
    expect(Device.getConfig(item)).toStrictEqual({
      "ackNeeded": true,
      "inverted": true,
      "pinNeeded": "1234"
    });
  });

  test('getState', () => {
    expect(Device.getState(item)).toStrictEqual({});
  });

  test('getMetadata', () => {
    expect(Device.getMetadata(item)).toStrictEqual({
      "attributes": {},
      "customData": {
        "ackNeeded": true,
        "deviceType": "DefaultDevice",
        "inverted": true,
        "itemType": "Number",
        "pinNeeded": "1234"
      },
      "deviceInfo": {
        "hwVersion": "2.5.0",
        "manufacturer": "openHAB",
        "model": "Number:DefaultDevice",
        "swVersion": "2.5.0",
      },
      "id": "DefaultDevice",
      "name": {
        "defaultNames": [
          "Default Device",
        ],
        "name": "Default Device",
        "nicknames": [
          "Default Device",
          "Standard Device"
        ],
      },
      "roomHint": undefined,
      "structureHint": undefined,
      "traits": [],
      "type": "",
      "willReportState": false
    });
  });

  test('hasTag', () => {
    expect(Device.hasTag({}, "testtag")).toBe(false);
    expect(Device.hasTag({ "tags": ["test"] }, "testtag")).toBe(false);
    expect(Device.hasTag({ "tags": ["testtag"] }, "testtag")).toBe(true);
    expect(Device.hasTag({ "tags": ["TestTag"] }, "testtag")).toBe(true);
  });
});

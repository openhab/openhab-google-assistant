const OpenHAB = require('../functions/openhab.js');

describe('OpenHAB', () => {
  test('getCommandType', () => {
    const command = OpenHAB.getCommandType('action.devices.commands.OnOff', { "on": true });
    expect(command).not.toBeUndefined();
    expect(command.name).toBe('OnOff');
  });

  describe('getDeviceForItem', () => {
    test('getDeviceForItem switch tag', () => {
      const device = OpenHAB.getDeviceForItem({ "type": "Switch", "metadata": { "ga": { "value": "Switch" } } });
      expect(device).not.toBeUndefined();
      expect(device.name).toBe('Switch');
    });

    test('getDeviceForItem switch tag', () => {
      const device = OpenHAB.getDeviceForItem({ "type": "Switch", "tags": ["Switchable"] });
      expect(device).not.toBeUndefined();
      expect(device.name).toBe('Switch');
    });
  });

  describe('handleSync', () => {
    const getItemsMock = jest.fn();

    const apiHandler = {
      getItems: getItemsMock
    };

    beforeEach(() => {
      getItemsMock.mockClear();
    });

    test('handleSync no matching items', async () => {
      getItemsMock.mockReturnValue(Promise.resolve([{ "name": "TestItem" }]));
      const openHAB = new OpenHAB(apiHandler);
      const result = await openHAB.handleSync();
      expect(getItemsMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({ "devices": [] });
    });

    test('handleSync single switch', async () => {
      getItemsMock.mockReturnValue(Promise.resolve([{
        "type": "Switch",
        "name": "SwitchItem",
        "label": "Switch Item",
        "metadata": { "ga": { "value": "Switch" } }
      }]));
      const openHAB = new OpenHAB(apiHandler);
      const result = await openHAB.handleSync();
      expect(getItemsMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        "devices": [
          {
            "attributes": {},
            "customData": {
              "deviceType": "Switch",
              "itemType": "Switch",
            },
            "deviceInfo": {
              "hwVersion": "2.5.0",
              "manufacturer": "openHAB",
              "model": "Switch:SwitchItem",
              "swVersion": "2.5.0",
            },
            "id": "SwitchItem",
            "name": {
              "defaultNames": [
                "Switch Item",
              ],
              "name": "Switch Item",
              "nicknames": [
                "Switch Item",
              ],
            },
            "roomHint": undefined,
            "structureHint": undefined,
            "traits": [
              "action.devices.traits.OnOff",
            ],
            "type": "action.devices.types.SWITCH",
            "willReportState": false,
          },
        ],
      });
    });

    test('handleSync switch and light group', async () => {
      getItemsMock.mockReturnValue(Promise.resolve([{
        "type": "Switch",
        "name": "SwitchItem",
        "label": "Switch Item",
        "metadata": { "ga": { "value": "Switch" } }
      },
      {
        "type": "Group",
        "name": "TVItem",
        "label": "TV Item",
        "metadata": { "ga": { "value": "TV" } }
      },
      {
        "type": "Switch",
        "name": "TVMute",
        "label": "TV Mute",
        "groupNames": ["TVItem"],
        "metadata": { "ga": { "value": "tvMute" } }
      },
      {
        "type": "Switch",
        "name": "TVPower",
        "label": "TV Power",
        "groupNames": ["TVItem"],
        "metadata": { "ga": { "value": "tvPower" } }
      }
      ]));
      const openHAB = new OpenHAB(apiHandler);
      const result = await openHAB.handleSync();
      expect(getItemsMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        "devices": [
          {
            "attributes": {},
            "customData": {
              "deviceType": "Switch",
              "itemType": "Switch"
            },
            "deviceInfo": {
              "hwVersion": "2.5.0",
              "manufacturer": "openHAB",
              "model": "Switch:SwitchItem",
              "swVersion": "2.5.0"
            },
            "id": "SwitchItem",
            "name": {
              "defaultNames": [
                "Switch Item"
              ],
              "name": "Switch Item",
              "nicknames": [
                "Switch Item"
              ],
            },
            "roomHint": undefined,
            "structureHint": undefined,
            "traits": [
              "action.devices.traits.OnOff"
            ],
            "type": "action.devices.types.SWITCH",
            "willReportState": false
          },
          {
            "attributes": {
              "volumeCanMuteAndUnmute": true
            },
            "customData": {
              "deviceType": "TV",
              "itemType": "Group"
            },
            "deviceInfo": {
              "hwVersion": "2.5.0",
              "manufacturer": "openHAB",
              "model": "Group:TVItem",
              "swVersion": "2.5.0"
            },
            "id": "TVItem",
            "name": {
              "defaultNames": [
                "TV Item"
              ],
              "name": "TV Item",
              "nicknames": [
                "TV Item"
              ],
            },
            "roomHint": undefined,
            "structureHint": undefined,
            "traits": [
              "action.devices.traits.OnOff",
              "action.devices.traits.Volume"
            ],
            "type": "action.devices.types.TV",
            "willReportState": false
          }
        ]
      });
    });
  });

  describe('handleQuery', () => {
    const getItemMock = jest.fn();

    const apiHandler = {
      getItem: getItemMock
    };

    beforeEach(() => {
      getItemMock.mockReset();
    });

    test('handleQuery device offline', async () => {
      getItemMock.mockReturnValue(Promise.reject({ "statusCode": 500 }));
      const openHAB = new OpenHAB(apiHandler);
      const result = await openHAB.handleQuery([{ "id": "TestItem" }]);
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        "devices": {
          "TestItem": {
            "errorCode": "deviceOffline",
            "status": "ERROR"
          }
        }
      });
    });

    test('handleQuery device not found', async () => {
      getItemMock.mockReturnValue(Promise.resolve({ "name": "TestItem" }));
      const openHAB = new OpenHAB(apiHandler);
      const result = await openHAB.handleQuery([{ "id": "TestItem" }]);
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        "devices": {
          "TestItem": {
            "errorCode": "deviceNotFound",
            "status": "ERROR"
          }
        }
      });
    });

    test('handleQuery device not ready', async () => {
      getItemMock.mockReturnValue(Promise.resolve({
        "name": "TestItem",
        "type": "Group",
        "groupType": "Switch",
        "state": "NULL",
        "metadata": { "ga": { "value": "Switch" } }
      }));
      const openHAB = new OpenHAB(apiHandler);
      const result = await openHAB.handleQuery([{ "id": "TestItem" }]);
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        "devices": {
          "TestItem": {
            "errorCode": "deviceNotReady",
            "status": "ERROR"
          }
        }
      });
    });

    // there is currently no case
    xtest('handleQuery notSupported', async () => {
      getItemMock.mockReturnValue(Promise.resolve({
        "name": "TestItem",
        "type": "Group",
        "state": "NULL",
        "metadata": {
          "ga": {
            "value": "Thermostat",
            "config": {
              "modes": "on=1,off=2"
            }
          }
        },
        "members": [
          {
            "state": "3",
            "metadata": { "ga": { "value": "thermostatMode" } }
          }
        ]
      }));
      const openHAB = new OpenHAB(apiHandler);
      const result = await openHAB.handleQuery([{ "id": "TestItem" }]);
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        "devices": {
          "TestItem": {
            "errorCode": "notSupported",
            "status": "ERROR"
          }
        }
      });
    });

    test('handleQuery Switch', async () => {
      getItemMock.mockReturnValue(Promise.resolve({
        "name": "TestItem",
        "type": "Switch",
        "state": "ON",
        "metadata": { "ga": { "value": "Switch" } }
      }));
      const openHAB = new OpenHAB(apiHandler);
      const result = await openHAB.handleQuery([{ "id": "TestItem" }]);
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        "devices": {
          "TestItem": {
            "status": "SUCCESS",
            "on": true,
            "online": true
          }
        }
      });
    });

    test('handleQuery mutliple devices', async () => {
      getItemMock.mockReturnValueOnce(Promise.resolve({
        "name": "TestItem",
        "type": "Switch",
        "state": "ON",
        "metadata": { "ga": { "value": "Switch" } }
      }));
      getItemMock.mockReturnValueOnce(Promise.resolve({
        "name": "TestItem2",
        "type": "Dimmer",
        "state": "50",
        "metadata": { "ga": { "value": "Light" } }
      }));
      const openHAB = new OpenHAB(apiHandler);
      const result = await openHAB.handleQuery([{ "id": "TestItem" }, { "id": "TestItem2" }]);
      expect(getItemMock).toHaveBeenCalledTimes(2);
      expect(result).toStrictEqual({
        "devices": {
          "TestItem": {
            "status": "SUCCESS",
            "on": true,
            "online": true
          },
          "TestItem2": {
            "status": "SUCCESS",
            "brightness": 50,
            "on": true,
            "online": true
          }
        }
      });
    });
  });

  describe('handleExecute', () => {
    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    beforeEach(() => {
      getItemMock.mockReset();
      sendCommandMock.mockReset();
    });

    test('handleExecute OnOff', async () => {
      sendCommandMock.mockReturnValue(Promise.resolve());
      const openHAB = new OpenHAB(apiHandler);
      const result = await openHAB.handleExecute([{
        "devices": [
          {
            "id": "TestItem",
            "customData": {}
          },
        ],
        "execution": [
          {
            "command": "action.devices.commands.OnOff",
            "params": { "on": true }
          }
        ]
      }]);
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        "commands": [
          {
            "ids": ["TestItem"],
            "states": {
              "on": true,
              "online": true
            },
            "status": "SUCCESS"
          }
        ]
      });
    });

    test('handleExecute function not supported', async () => {
      const openHAB = new OpenHAB(apiHandler);
      const result = await openHAB.handleExecute([{
        "devices": [
          {
            "id": "TestItem",
            "customData": {}
          },
        ],
        "execution": [
          {
            "command": "action.devices.commands.Invalid",
            "params": {}
          }
        ]
      }]);
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(0);
      expect(result).toStrictEqual({
        "commands": [
          {
            "ids": ["TestItem"],
            "errorCode": "functionNotSupported",
            "status": "ERROR"
          }
        ]
      });
    });

    test('handleExecute ThermostatTemperatureSetRange', async () => {
      getItemMock.mockReturnValue(Promise.resolve({
        "name": "TestItem",
        "type": "Group",
        "metadata": {
          "ga": {
            "value": "Thermostat",
          }
        },
        "members": [
          {
            "name": "High",
            "state": "25",
            "metadata": {
              "ga": {
                "value": "thermostatTemperatureSetpointHigh"
              }
            }
          },
          {
            "name": "Low",
            "state": "5",
            "metadata": {
              "ga": {
                "value": "thermostatTemperatureSetpointLow"
              }
            }
          }
        ]
      }));
      sendCommandMock.mockReturnValue(Promise.resolve());
      const openHAB = new OpenHAB(apiHandler);
      const result = await openHAB.handleExecute([{
        "devices": [
          {
            "id": "TestItem",
            "customData": {}
          },
        ],
        "execution": [
          {
            "command": "action.devices.commands.ThermostatTemperatureSetRange",
            "params": {
              "thermostatTemperatureSetpointLow": 10,
              "thermostatTemperatureSetpointHigh": 20
            }
          }
        ]
      }]);
      expect(getItemMock).toHaveBeenCalledTimes(2);
      expect(sendCommandMock).toHaveBeenCalledTimes(2);
      expect(result).toStrictEqual({
        "commands": [
          {
            "ids": ["TestItem"],
            "states": {
              "thermostatTemperatureSetpointHigh": 25,
              "thermostatTemperatureSetpointLow": 10,
              "online": true
            },
            "status": "SUCCESS"
          }
        ]
      });
    });
  });
});

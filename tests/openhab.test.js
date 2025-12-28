const OpenHAB = require('../functions/openhab.js');
const packageVersion = require('../functions/package.json').version;

describe('OpenHAB', () => {
  test('setTokenFromHeader', () => {
    const openHAB = new OpenHAB({ authToken: '' });
    openHAB.setTokenFromHeader({});
    expect(openHAB._apiHandler.authToken).toBe(null);
    openHAB.setTokenFromHeader({ authorization: 'Bearer token' });
    expect(openHAB._apiHandler.authToken).toBe('token');
  });

  test('onDisconnect', () => {
    const openHAB = new OpenHAB({});
    expect(openHAB.onDisconnect()).toStrictEqual({});
  });

  describe('onSync', () => {
    const openHAB = new OpenHAB({});

    beforeEach(() => {
      jest.spyOn(openHAB, 'handleSync').mockReset();
    });

    test('onSync failure', async () => {
      const handleSyncMock = jest.spyOn(openHAB, 'handleSync');
      handleSyncMock.mockRejectedValue(null);
      const result = await openHAB.onSync({ requestId: '1234' }, {});
      expect(handleSyncMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        requestId: '1234',
        payload: {
          devices: [],
          errorCode: 'actionNotAvailable',
          status: 'ERROR'
        }
      });
    });

    test('onSync empty', async () => {
      const handleSyncMock = jest.spyOn(openHAB, 'handleSync');
      const payload = { devices: [] };
      handleSyncMock.mockResolvedValue(payload);
      const result = await openHAB.onSync({ requestId: '1234' }, {});
      expect(handleSyncMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        requestId: '1234',
        payload: payload
      });
    });
  });

  describe('handleSync', () => {
    const getItemsMock = jest.fn();

    const apiHandler = {
      getItems: getItemsMock
    };

    const openHAB = new OpenHAB(apiHandler);

    beforeEach(() => {
      getItemsMock.mockClear();
    });

    test('handleSync no matching items', async () => {
      getItemsMock.mockResolvedValue([{ name: 'TestItem' }]);
      const result = await openHAB.handleSync();
      expect(getItemsMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({ devices: [] });
    });

    test('handleSync single switch', async () => {
      getItemsMock.mockReturnValue(
        Promise.resolve([
          {
            type: 'Switch',
            name: 'SwitchItem',
            label: 'Switch Item',
            metadata: { ga: { value: 'Switch', config: { queryOnly: true } } }
          }
        ])
      );
      const result = await openHAB.handleSync();
      expect(getItemsMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        devices: [
          {
            attributes: {
              queryOnlyOnOff: true
            },
            customData: {
              deviceType: 'Switch',
              itemType: 'Switch'
            },
            deviceInfo: {
              manufacturer: 'openHAB',
              model: 'Switch:SwitchItem',
              hwVersion: '3.0.0',
              swVersion: packageVersion
            },
            id: 'SwitchItem',
            name: {
              defaultNames: ['Switch Item'],
              name: 'Switch Item',
              nicknames: ['Switch Item']
            },
            roomHint: undefined,
            structureHint: undefined,
            traits: ['action.devices.traits.OnOff'],
            type: 'action.devices.types.SWITCH',
            willReportState: false
          }
        ]
      });
    });

    test('handleSync switch and light group', async () => {
      getItemsMock.mockReturnValue(
        Promise.resolve([
          {
            type: 'Switch',
            name: 'SwitchItem',
            label: 'Switch Item',
            metadata: { ga: { value: 'Switch' } }
          },
          {
            type: 'Group',
            name: 'LightItem',
            label: 'Light Item',
            metadata: { ga: { value: 'SpecialColorLight' } }
          },
          {
            type: 'Color',
            name: 'LightColor',
            label: 'Light Color',
            groupNames: ['LightItem'],
            metadata: { ga: { value: 'lightColor' } }
          },
          {
            type: 'Switch',
            name: 'LightPower',
            label: 'Light Power',
            groupNames: ['LightItem'],
            metadata: { ga: { value: 'lightPower' } }
          }
        ])
      );
      const result = await openHAB.handleSync();
      expect(getItemsMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        devices: [
          {
            attributes: {
              queryOnlyOnOff: false
            },
            customData: {
              deviceType: 'Switch',
              itemType: 'Switch'
            },
            deviceInfo: {
              manufacturer: 'openHAB',
              model: 'Switch:SwitchItem',
              hwVersion: '3.0.0',
              swVersion: packageVersion
            },
            id: 'SwitchItem',
            name: {
              defaultNames: ['Switch Item'],
              name: 'Switch Item',
              nicknames: ['Switch Item']
            },
            roomHint: undefined,
            structureHint: undefined,
            traits: ['action.devices.traits.OnOff'],
            type: 'action.devices.types.SWITCH',
            willReportState: false
          },
          {
            attributes: {
              colorModel: 'hsv'
            },
            customData: {
              deviceType: 'SpecialColorLight',
              itemType: 'Group',
              members: {
                lightColor: 'LightColor',
                lightPower: 'LightPower'
              }
            },
            deviceInfo: {
              manufacturer: 'openHAB',
              model: 'Group:LightItem',
              hwVersion: '3.0.0',
              swVersion: packageVersion
            },
            id: 'LightItem',
            name: {
              defaultNames: ['Light Item'],
              name: 'Light Item',
              nicknames: ['Light Item']
            },
            roomHint: undefined,
            structureHint: undefined,
            traits: [
              'action.devices.traits.OnOff',
              'action.devices.traits.Brightness',
              'action.devices.traits.ColorSetting'
            ],
            type: 'action.devices.types.LIGHT',
            willReportState: false
          }
        ]
      });
    });
  });

  describe('onQuery', () => {
    const openHAB = new OpenHAB({});

    beforeEach(() => {
      jest.spyOn(openHAB, 'handleQuery').mockReset();
    });

    test('onQuery failure', async () => {
      const handleQueryMock = jest.spyOn(openHAB, 'handleQuery');
      handleQueryMock.mockRejectedValue(null);
      const result = await openHAB.onQuery({ requestId: '1234' }, {});
      expect(handleQueryMock).toHaveBeenCalledTimes(1);
      expect(handleQueryMock).toHaveBeenCalledWith([]);
      expect(result).toStrictEqual({
        requestId: '1234',
        payload: {
          devices: {},
          errorCode: 'actionNotAvailable',
          status: 'ERROR'
        }
      });
    });

    test('onQuery empty', async () => {
      const handleQueryMock = jest.spyOn(openHAB, 'handleQuery');
      const payload = { devices: {} };
      handleQueryMock.mockResolvedValue(payload);
      const result = await openHAB.onQuery({ requestId: '1234' }, {});
      expect(handleQueryMock).toHaveBeenCalledTimes(1);
      expect(handleQueryMock).toHaveBeenCalledWith([]);
      expect(result).toStrictEqual({
        requestId: '1234',
        payload: payload
      });
    });

    test('onQuery', async () => {
      const handleQueryMock = jest.spyOn(openHAB, 'handleQuery');
      const payload = { devices: {} };
      handleQueryMock.mockResolvedValue(payload);
      const devices = [{ id: 'TestItem1' }, { id: 'TestItem2' }];
      const body = {
        requestId: '1234',
        inputs: [
          {
            intent: 'action.devices.QUERY',
            payload: {
              devices: devices
            }
          }
        ]
      };
      const result = await openHAB.onQuery(body, {});
      expect(handleQueryMock).toHaveBeenCalledTimes(1);
      expect(handleQueryMock).toHaveBeenCalledWith(devices);
      expect(result).toStrictEqual({
        requestId: '1234',
        payload: payload
      });
    });
  });

  describe('handleQuery', () => {
    const getItemMock = jest.fn();

    const apiHandler = {
      getItem: getItemMock
    };

    const openHAB = new OpenHAB(apiHandler);

    beforeEach(() => {
      getItemMock.mockReset();
    });

    test('handleQuery device offline', async () => {
      getItemMock.mockRejectedValue({ statusCode: 500 });
      const result = await openHAB.handleQuery([{ id: 'TestItem' }]);
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        devices: {
          TestItem: {
            errorCode: 'deviceOffline',
            status: 'ERROR'
          }
        }
      });
    });

    test('handleQuery device not found', async () => {
      getItemMock.mockResolvedValue({ name: 'TestItem' });
      const result = await openHAB.handleQuery([{ id: 'TestItem' }]);
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        devices: {
          TestItem: {
            errorCode: 'deviceNotFound',
            status: 'ERROR'
          }
        }
      });
    });

    test('handleQuery device not ready', async () => {
      getItemMock.mockReturnValue(
        Promise.resolve({
          name: 'TestItem',
          type: 'Group',
          groupType: 'Switch',
          state: 'NULL',
          metadata: { ga: { value: 'Switch' } }
        })
      );
      const result = await openHAB.handleQuery([{ id: 'TestItem' }]);
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        devices: {
          TestItem: {
            errorCode: 'deviceNotReady',
            status: 'ERROR'
          }
        }
      });
    });

    test('handleQuery Switch', async () => {
      getItemMock.mockReturnValue(
        Promise.resolve({
          name: 'TestItem',
          type: 'Switch',
          state: 'ON',
          metadata: { ga: { value: 'Switch' } }
        })
      );
      const result = await openHAB.handleQuery([{ id: 'TestItem' }]);
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        devices: {
          TestItem: {
            status: 'SUCCESS',
            on: true,
            online: true
          }
        }
      });
    });

    test('handleQuery multiple devices', async () => {
      getItemMock.mockReturnValueOnce(
        Promise.resolve({
          name: 'TestItem',
          type: 'Switch',
          state: 'ON',
          metadata: { ga: { value: 'Switch' } }
        })
      );
      getItemMock.mockReturnValueOnce(
        Promise.resolve({
          name: 'TestItem2',
          type: 'Dimmer',
          state: '50',
          metadata: { ga: { value: 'Light' } }
        })
      );
      const result = await openHAB.handleQuery([{ id: 'TestItem' }, { id: 'TestItem2' }]);
      expect(getItemMock).toHaveBeenCalledTimes(2);
      expect(result).toStrictEqual({
        devices: {
          TestItem: {
            status: 'SUCCESS',
            on: true,
            online: true
          },
          TestItem2: {
            status: 'SUCCESS',
            brightness: 50,
            on: true,
            online: true
          }
        }
      });
    });

    test('handleQuery error with errorCode and debugString', async () => {
      getItemMock.mockRejectedValue({
        errorCode: 'valueOutOfRange',
        debugString: 'Temperature exceeds maximum supported range'
      });
      const result = await openHAB.handleQuery([{ id: 'TestItem' }]);
      expect(result).toStrictEqual({
        devices: {
          TestItem: {
            status: 'ERROR',
            errorCode: 'valueOutOfRange',
            debugString: 'Temperature exceeds maximum supported range'
          }
        }
      });
    });
  });

  describe('onExecute', () => {
    const openHAB = new OpenHAB({});

    beforeEach(() => {
      jest.spyOn(openHAB, 'handleExecute').mockReset();
    });

    test('onExecute failure', async () => {
      const handleExecuteMock = jest.spyOn(openHAB, 'handleExecute');
      handleExecuteMock.mockRejectedValue(null);
      const result = await openHAB.onExecute({ requestId: '1234' }, {});
      expect(handleExecuteMock).toHaveBeenCalledTimes(1);
      expect(handleExecuteMock).toHaveBeenCalledWith([]);
      expect(result).toStrictEqual({
        requestId: '1234',
        payload: {
          commands: [],
          errorCode: 'actionNotAvailable',
          status: 'ERROR'
        }
      });
    });

    test('onExecute empty', async () => {
      const handleExecuteMock = jest.spyOn(openHAB, 'handleExecute');
      const payload = { commands: [] };
      handleExecuteMock.mockResolvedValue(payload);
      const result = await openHAB.onExecute({ requestId: '1234' }, {});
      expect(handleExecuteMock).toHaveBeenCalledTimes(1);
      expect(handleExecuteMock).toHaveBeenCalledWith([]);
      expect(result).toStrictEqual({
        requestId: '1234',
        payload: payload
      });
    });

    test('onExecute', async () => {
      const handleExecuteMock = jest.spyOn(openHAB, 'handleExecute');
      const payload = { commands: [] };
      handleExecuteMock.mockResolvedValue(payload);
      const commands = [
        {
          devices: [{ id: '123' }, { id: '456' }],
          execution: [
            {
              command: 'action.devices.commands.OnOff',
              params: { on: true }
            }
          ]
        }
      ];
      const body = {
        requestId: '1234',
        inputs: [
          {
            intent: 'action.devices.EXECUTE',
            payload: {
              commands: commands
            }
          }
        ]
      };
      const result = await openHAB.onExecute(body, {});
      expect(handleExecuteMock).toHaveBeenCalledTimes(1);
      expect(handleExecuteMock).toHaveBeenCalledWith(commands);
      expect(result).toStrictEqual({
        requestId: '1234',
        payload: payload
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

    const openHAB = new OpenHAB(apiHandler);

    beforeEach(() => {
      getItemMock.mockReset();
      sendCommandMock.mockReset();
    });

    test('handleExecute OnOff', async () => {
      sendCommandMock.mockResolvedValue(null);
      const commands = [
        {
          devices: [
            {
              id: 'TestItem',
              customData: {}
            }
          ],
          execution: [
            {
              command: 'action.devices.commands.OnOff',
              params: { on: true }
            }
          ]
        }
      ];
      const result = await openHAB.handleExecute(commands);
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        commands: [
          {
            ids: ['TestItem'],
            states: {
              on: true,
              online: true
            },
            status: 'SUCCESS'
          }
        ]
      });
    });

    test('handleExecute error', async () => {
      sendCommandMock.mockReturnValue(Promise.reject({ errorCode: 0 }));
      const commands = [
        {
          devices: [
            {
              id: 'TestItem',
              customData: {}
            }
          ],
          execution: [
            {
              command: 'action.devices.commands.OnOff',
              params: { on: true }
            }
          ]
        }
      ];
      const result = await openHAB.handleExecute(commands);
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        commands: [
          {
            ids: ['TestItem'],
            errorCode: 'deviceOffline',
            status: 'ERROR'
          }
        ]
      });
    });

    test('handleExecute function not supported', async () => {
      const commands = [
        {
          devices: [
            {
              id: 'TestItem',
              customData: {}
            }
          ],
          execution: [
            {
              command: 'action.devices.commands.Invalid',
              params: {}
            }
          ]
        }
      ];
      const result = await openHAB.handleExecute(commands);
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(0);
      expect(result).toStrictEqual({
        commands: [
          {
            ids: ['TestItem'],
            errorCode: 'functionNotSupported',
            status: 'ERROR'
          }
        ]
      });
    });

    test('handleExecute ThermostatTemperatureSetRange', async () => {
      getItemMock.mockReturnValue(
        Promise.resolve({
          name: 'TestItem',
          type: 'Group',
          metadata: {
            ga: {
              value: 'Thermostat'
            }
          },
          members: [
            {
              name: 'High',
              state: '25',
              type: 'Number',
              metadata: {
                ga: {
                  value: 'thermostatTemperatureSetpointHigh'
                }
              }
            },
            {
              name: 'Low',
              state: '5',
              type: 'Number',
              metadata: {
                ga: {
                  value: 'thermostatTemperatureSetpointLow'
                }
              }
            }
          ]
        })
      );
      sendCommandMock.mockResolvedValue(null);
      const commands = [
        {
          devices: [
            {
              id: 'TestItem',
              customData: {
                members: {
                  thermostatTemperatureSetpointHigh: 'Test1',
                  thermostatTemperatureSetpointLow: 'Test2'
                }
              }
            }
          ],
          execution: [
            {
              command: 'action.devices.commands.ThermostatTemperatureSetRange',
              params: {
                thermostatTemperatureSetpointLow: 10,
                thermostatTemperatureSetpointHigh: 20
              }
            }
          ]
        }
      ];
      const result = await openHAB.handleExecute(commands);
      expect(getItemMock).toHaveBeenCalledTimes(2);
      expect(sendCommandMock).toHaveBeenCalledTimes(2);
      expect(result).toStrictEqual({
        commands: [
          {
            ids: ['TestItem'],
            states: {
              thermostatTemperatureSetpointHigh: 25,
              thermostatTemperatureSetpointLow: 10,
              online: true
            },
            status: 'SUCCESS'
          }
        ]
      });
    });
  });
});

describe('Error Code Propagation', () => {
  const getItemMock = jest.fn();
  const sendCommandMock = jest.fn();

  const apiHandler = {
    getItem: getItemMock,
    sendCommand: sendCommandMock
  };

  const openHAB = new OpenHAB(apiHandler);

  beforeEach(() => {
    getItemMock.mockReset();
    sendCommandMock.mockReset();
  });

  describe('QUERY error handling', () => {
    test('propagates errorCode from device/command', async () => {
      getItemMock.mockRejectedValue({
        errorCode: 'notSupported',
        debugString: 'Device does not support this operation'
      });
      const result = await openHAB.handleQuery([{ id: 'TestItem' }]);
      expect(result.devices.TestItem).toStrictEqual({
        status: 'ERROR',
        errorCode: 'notSupported',
        debugString: 'Device does not support this operation'
      });
    });

    test('maps statusCode 404 to deviceNotFound', async () => {
      getItemMock.mockRejectedValue({ statusCode: 404 });
      const result = await openHAB.handleQuery([{ id: 'TestItem' }]);
      expect(result.devices.TestItem.errorCode).toBe('deviceNotFound');
    });

    test('maps statusCode 406 to deviceNotReady', async () => {
      getItemMock.mockRejectedValue({ statusCode: 406 });
      const result = await openHAB.handleQuery([{ id: 'TestItem' }]);
      expect(result.devices.TestItem.errorCode).toBe('deviceNotReady');
    });

    test('defaults unmapped errors to deviceOffline', async () => {
      getItemMock.mockRejectedValue({ statusCode: 500, message: 'Unknown error' });
      const result = await openHAB.handleQuery([{ id: 'TestItem' }]);
      expect(result.devices.TestItem.errorCode).toBe('deviceOffline');
    });
  });

  describe('EXECUTE error handling', () => {
    test('returns functionNotSupported for unknown command', async () => {
      const commands = [
        {
          devices: [{ id: 'TestItem', customData: {} }],
          execution: [
            {
              command: 'action.devices.commands.UnknownCommand',
              params: {}
            }
          ]
        }
      ];
      const result = await openHAB.handleExecute(commands);
      expect(result.commands[0]).toStrictEqual({
        ids: ['TestItem'],
        status: 'ERROR',
        errorCode: 'functionNotSupported'
      });
    });
  });
});

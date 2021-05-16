const OpenHAB = require('../functions/openhab.js');
const packageVersion = require('../package.json').version;

describe('OpenHAB', () => {
  test('getCommandType', () => {
    const command = OpenHAB.getCommandType('action.devices.commands.OnOff', { on: true });
    expect(command).not.toBeUndefined();
    expect(command.name).toBe('OnOff');
  });

  describe('getDeviceForItem', () => {
    test('getDeviceForItem switch tag', () => {
      const device = OpenHAB.getDeviceForItem({ type: 'Switch', metadata: { ga: { value: 'Switch' } } });
      expect(device).not.toBeUndefined();
      expect(device.name).toBe('Switch');
    });

    test('getDeviceForItem switch tag', () => {
      const device = OpenHAB.getDeviceForItem({ type: 'Switch', tags: ['Switchable'] });
      expect(device).not.toBeUndefined();
      expect(device.name).toBe('Switch');
    });
  });

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
      handleSyncMock.mockReturnValue(Promise.reject());
      const result = await openHAB.onSync({ requestId: '1234' }, {});
      expect(handleSyncMock).toBeCalledTimes(1);
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
      handleSyncMock.mockReturnValue(Promise.resolve(payload));
      const result = await openHAB.onSync({ requestId: '1234' }, {});
      expect(handleSyncMock).toBeCalledTimes(1);
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
      getItemsMock.mockReturnValue(Promise.resolve([{ name: 'TestItem' }]));
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
            metadata: { ga: { value: 'Switch' } }
          }
        ])
      );
      const result = await openHAB.handleSync();
      expect(getItemsMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        devices: [
          {
            attributes: {},
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
            name: 'TVItem',
            label: 'TV Item',
            metadata: { ga: { value: 'TV' } }
          },
          {
            type: 'Switch',
            name: 'TVMute',
            label: 'TV Mute',
            groupNames: ['TVItem'],
            metadata: { ga: { value: 'tvMute' } }
          },
          {
            type: 'Switch',
            name: 'TVPower',
            label: 'TV Power',
            groupNames: ['TVItem'],
            metadata: { ga: { value: 'tvPower' } }
          }
        ])
      );
      const result = await openHAB.handleSync();
      expect(getItemsMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        devices: [
          {
            attributes: {},
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
              volumeCanMuteAndUnmute: true
            },
            customData: {
              deviceType: 'TV',
              itemType: 'Group'
            },
            deviceInfo: {
              manufacturer: 'openHAB',
              model: 'Group:TVItem',
              hwVersion: '3.0.0',
              swVersion: packageVersion
            },
            id: 'TVItem',
            name: {
              defaultNames: ['TV Item'],
              name: 'TV Item',
              nicknames: ['TV Item']
            },
            roomHint: undefined,
            structureHint: undefined,
            traits: ['action.devices.traits.OnOff', 'action.devices.traits.Volume'],
            type: 'action.devices.types.TV',
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
      handleQueryMock.mockReturnValue(Promise.reject());
      const result = await openHAB.onQuery({ requestId: '1234' }, {});
      expect(handleQueryMock).toBeCalledTimes(1);
      expect(handleQueryMock).toBeCalledWith([]);
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
      handleQueryMock.mockReturnValue(Promise.resolve(payload));
      const result = await openHAB.onQuery({ requestId: '1234' }, {});
      expect(handleQueryMock).toBeCalledTimes(1);
      expect(handleQueryMock).toBeCalledWith([]);
      expect(result).toStrictEqual({
        requestId: '1234',
        payload: payload
      });
    });

    test('onQuery', async () => {
      const handleQueryMock = jest.spyOn(openHAB, 'handleQuery');
      const payload = { devices: {} };
      handleQueryMock.mockReturnValue(Promise.resolve(payload));
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
      expect(handleQueryMock).toBeCalledTimes(1);
      expect(handleQueryMock).toBeCalledWith(devices);
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
      getItemMock.mockReturnValue(Promise.reject({ statusCode: 500 }));
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
      getItemMock.mockReturnValue(Promise.resolve({ name: 'TestItem' }));
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

    // there is currently no case
    xtest('handleQuery notSupported', async () => {
      getItemMock.mockReturnValue(
        Promise.resolve({
          name: 'TestItem',
          type: 'Group',
          state: 'NULL',
          metadata: {
            ga: {
              value: 'Thermostat',
              config: {
                modes: 'on=1,off=2'
              }
            }
          },
          members: [
            {
              state: '3',
              metadata: { ga: { value: 'thermostatMode' } }
            }
          ]
        })
      );
      const result = await openHAB.handleQuery([{ id: 'TestItem' }]);
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        devices: {
          TestItem: {
            errorCode: 'notSupported',
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

    test('handleQuery mutliple devices', async () => {
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
  });

  describe('onExecute', () => {
    const openHAB = new OpenHAB({});

    beforeEach(() => {
      jest.spyOn(openHAB, 'handleExecute').mockReset();
    });

    test('onExecute failure', async () => {
      const handleExecuteMock = jest.spyOn(openHAB, 'handleExecute');
      handleExecuteMock.mockReturnValue(Promise.reject());
      const result = await openHAB.onExecute({ requestId: '1234' }, {});
      expect(handleExecuteMock).toBeCalledTimes(1);
      expect(handleExecuteMock).toBeCalledWith([]);
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
      handleExecuteMock.mockReturnValue(Promise.resolve(payload));
      const result = await openHAB.onExecute({ requestId: '1234' }, {});
      expect(handleExecuteMock).toBeCalledTimes(1);
      expect(handleExecuteMock).toBeCalledWith([]);
      expect(result).toStrictEqual({
        requestId: '1234',
        payload: payload
      });
    });

    test('onExecute', async () => {
      const handleExecuteMock = jest.spyOn(openHAB, 'handleExecute');
      const payload = { commands: [] };
      handleExecuteMock.mockReturnValue(Promise.resolve(payload));
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
      expect(handleExecuteMock).toBeCalledTimes(1);
      expect(handleExecuteMock).toBeCalledWith(commands);
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
      sendCommandMock.mockReturnValue(Promise.resolve());
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
              metadata: {
                ga: {
                  value: 'thermostatTemperatureSetpointHigh'
                }
              }
            },
            {
              name: 'Low',
              state: '5',
              metadata: {
                ga: {
                  value: 'thermostatTemperatureSetpointLow'
                }
              }
            }
          ]
        })
      );
      sendCommandMock.mockReturnValue(Promise.resolve());
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

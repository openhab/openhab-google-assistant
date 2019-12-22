
const OpenHAB = require('../functions/openhab.js').OpenHAB;

describe('Test SYNC with Metadata', () => {
  test('Light Devices', async () => {
    const items = [
      {
        "state": "OFF",
        "type": "Switch",
        "name": "MySwitch",
        "label": "SwitchLight",
        "metadata": {
          "ga": {
            "value": "Light",
            "config": {
              "name": "Light Switch"
            }
          },
          "synonyms": {
            "value": "Testlight,Cool Light"
          }
        }
      },
      {
        "state": "0",
        "type": "Dimmer",
        "name": "MyDimmer",
        "label": "DimmLight",
        "metadata": {
          "ga": {
            "value": "Light"
          }
        }
      },
      {
        "state": "0,0,0",
        "type": "Color",
        "name": "MyLight",
        "label": "ColorLight",
        "metadata": {
          "ga": {
            "value": "Light"
          }
        }
      },
      {
        "members": [],
        "state": "NULL",
        "type": "Group",
        "groupType": "Switch",
        "name": "MyLightGroup",
        "label": "GroupLight",
        "metadata": {
          "ga": {
            "value": "Light"
          }
        }
      },
      {
        "members": [],
        "state": "NULL",
        "type": "Group",
        "groupType": "Dimmer",
        "name": "MyDimmerGroup",
        "label": "GroupDimmer",
        "metadata": {
          "ga": {
            "value": "Light"
          }
        }
      },
      {
        "members": [],
        "state": "NULL",
        "type": "Group",
        "groupType": "Color",
        "name": "MyColorGroup",
        "label": "GroupColor",
        "metadata": {
          "ga": {
            "value": "Light"
          }
        }
      }
    ];

    const getItemsMock = jest.fn();
    getItemsMock.mockReturnValue(Promise.resolve(items));

    const apiHandler = {
      getItems: getItemsMock
    };

    const payload = await new OpenHAB(apiHandler).handleSync();

    expect(getItemsMock).toHaveBeenCalledTimes(1);
    expect(payload).toMatchSnapshot();
  });
});

describe('Test QUERY with Metadata', () => {
  test('Single Light Device ', async () => {
    const item =
    {
      "state": "OFF",
      "type": "Switch",
      "name": "MySwitch",
      "metadata": {
        "ga": {
          "value": "Light"
        }
      }
    };

    const getItemMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve(item));

    const apiHandler = {
      getItem: getItemMock
    };

    const payload = await new OpenHAB(apiHandler).handleQuery([{
      "id": "MySwitch"
    }]);

    expect(getItemMock).toHaveBeenCalledTimes(1);
    expect(payload).toStrictEqual({
      "devices": {
        "MySwitch": {
          "on": false,
          "online": true,
        },
      },
    });
  });

  test('Multiple Light Devices', async () => {
    const item1 =
    {
      "state": "OFF",
      "type": "Switch",
      "name": "MySwitch",
      "metadata": {
        "ga": {
          "value": "Light"
        }
      }
    };

    const item2 =
    {
      "state": "20",
      "type": "Dimmer",
      "name": "MyDimmer",
      "metadata": {
        "ga": {
          "value": "Light"
        }
      }
    };

    const getItemMock = jest.fn();
    getItemMock.mockReturnValueOnce(Promise.resolve(item1))
      .mockReturnValueOnce(Promise.resolve(item2));

    const apiHandler = {
      getItem: getItemMock
    };

    const payload = await new OpenHAB(apiHandler).handleQuery([{
      "id": "MySwitch"
    }, {
      "id": "MyDimmer"
    }]);

    expect(getItemMock).toHaveBeenCalledTimes(2);
    expect(payload).toStrictEqual({
      "devices": {
        "MySwitch": {
          "on": false,
          "online": true,
        },
        "MyDimmer": {
          "on": true,
          "brightness": 20,
          "online": true,
        },
      },
    });
  });
});

describe('Test EXECUTE with Metadata', () => {
  test('ThermostatTemperatureSetpoint', async () => {
    const item =
    {
      "state": "NULL",
      "type": "Group",
      "name": "MyThermostat",
      "label": "Thermostat",
      "metadata": {
        "ga": {
          "value": "Thermostat",
          "config": {
            "useFahrenheit": true
          }
        }
      },
      "members": [{
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatTemperatureAmbient'
          }
        },
        state: '10'
      }, {
        name: 'MyTargetTemperature',
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatTemperatureSetpoint'
          }
        },
        state: '10'
      }, {
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatMode'
          }
        },
        state: '1'
      }, {
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatHumidityAmbient'
          }
        },
        state: '50'
      }]
    };

    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve(item));
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "customData": {
          "thermostatTemperatureSetpoint": "MyTargetTemperature"
        },
        "id": "MyThermostat"
      }],
      "execution": [{
        "command": "action.devices.commands.ThermostatTemperatureSetpoint",
        "params": {
          "thermostatTemperatureSetpoint": 25
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(1);
    expect(sendCommandMock).toBeCalledWith('MyTargetTemperature', '77');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyThermostat"
        ],
        "states": {
          "online": true,
          "thermostatHumidityAmbient": 50,
          "thermostatMode": "heat",
          "thermostatTemperatureAmbient": -12.2,
          "thermostatTemperatureSetpoint": 25
        },
        "status": "SUCCESS"
      }]
    });
  });

  test('ThermostatTemperatureSetRange', async () => {
    const item1 =
    {
      "state": "NULL",
      "type": "Group",
      "name": "MyThermostat",
      "label": "Thermostat",
      "metadata": {
        "ga": {
          "value": "Thermostat"
        }
      },
      "members": [{
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatTemperatureAmbient'
          }
        },
        state: '10'
      }, {
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatTemperatureSetpoint'
          }
        },
        state: '10'
      }, {
        name: 'MyTargetTemperatureHigh',
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatTemperatureSetpointHigh'
          }
        },
        state: '13'
      }, {
        name: 'MyTargetTemperatureLow',
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatTemperatureSetpointLow'
          }
        },
        state: '7'
      }, {
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatMode'
          }
        },
        state: 'heatcool'
      }, {
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatHumidityAmbient'
          }
        },
        state: '50'
      }]
    };

    const item2 =
    {
      "state": "NULL",
      "type": "Group",
      "name": "MyThermostat",
      "label": "Thermostat",
      "metadata": {
        "ga": {
          "value": "Thermostat"
        }
      },
      "members": [{
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatTemperatureAmbient'
          }
        },
        state: '10'
      }, {
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatTemperatureSetpoint'
          }
        },
        state: '10'
      }, {
        name: 'MyTargetTemperatureHigh',
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatTemperatureSetpointHigh'
          }
        },
        state: '25'
      }, {
        name: 'MyTargetTemperatureLow',
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatTemperatureSetpointLow'
          }
        },
        state: '7'
      }, {
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatMode'
          }
        },
        state: 'heatcool'
      }, {
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatHumidityAmbient'
          }
        },
        state: '50'
      }]
    };

    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();
    getItemMock.mockReturnValueOnce(Promise.resolve(item1))
      .mockReturnValueOnce(Promise.resolve(item2));
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "customData": {
          "thermostatTemperatureSetpointHigh": "MyTargetTemperatureHigh",
          "thermostatTemperatureSetpointLow": "MyTargetTemperatureLow"
        },
        "id": "MyThermostat"
      }],
      "execution": [{
        "command": "action.devices.commands.ThermostatTemperatureSetRange",
        "params": {
          "thermostatTemperatureSetpointHigh": 25,
          "thermostatTemperatureSetpointLow": 15
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(2);
    expect(sendCommandMock).toBeCalledWith('MyTargetTemperatureHigh', '25');
    expect(sendCommandMock).toBeCalledWith('MyTargetTemperatureLow', '15');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyThermostat"
        ],
        "states": {
          "online": true,
          "thermostatHumidityAmbient": 50,
          "thermostatMode": "heatcool",
          "thermostatTemperatureAmbient": 10,
          "thermostatTemperatureSetpoint": 10,
          "thermostatTemperatureSetpointHigh": 25,
          "thermostatTemperatureSetpointLow": 15
        },
        "status": "SUCCESS"
      }]
    });
  });

  test('ThermostatSetMode', async () => {
    const item =
    {
      "state": "NULL",
      "type": "Group",
      "name": "MyThermostat",
      "label": "Thermostat",
      "metadata": {
        "ga": {
          "value": "Thermostat"
        }
      },
      "members": [{
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatTemperatureAmbient'
          }
        },
        state: '20'
      }, {
        name: 'MyTargetTemperature',
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatTemperatureSetpoint'
          }
        },
        state: '10'
      }, {
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatMode'
          }
        },
        state: '1'
      }, {
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatHumidityAmbient'
          }
        },
        state: '50'
      }]
    };

    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve(item));
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "customData": {
          "thermostatMode": "MyMode"
        },
        "id": "MyThermostat"
      }],
      "execution": [{
        "command": "action.devices.commands.ThermostatSetMode",
        "params": {
          "thermostatMode": "off"
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(1);
    expect(sendCommandMock).toBeCalledWith('MyMode', '0');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyThermostat"
        ],
        "states": {
          "online": true,
          "thermostatHumidityAmbient": 50,
          "thermostatMode": "off",
          "thermostatTemperatureAmbient": 20,
          "thermostatTemperatureSetpoint": 10
        },
        "status": "SUCCESS"
      }]
    });
  });
});

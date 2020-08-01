const OpenHAB = require('../functions/openhab.js');

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

  test('Fan Device', async () => {
    const items = [
      {
        "state": "50",
        "metadata": {
          "ga": {
            "value": "FAN",
            "config": {
              "ordered": true,
              "speeds": "0\u003dnull:off,50\u003dslow,100\u003dfull:fast",
              "lang": "en"
            }
          }
        },
        "type": "Dimmer",
        "name": "MyFan",
        "label": "My Fan",
        "tags": []
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

  test('Scene Device', async () => {
    const items = [
      {
        "state": "OFF",
        "metadata": {
          "ga": {
            "value": "Scene"
          }
        },
        "type": "Switch",
        "name": "MyScene",
        "label": "My Scene",
        "tags": []
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

  test('Thermostat Device', async () => {
    const items = [
      {
        "state": "NULL",
        "metadata": {
          "ga": {
            "value": "Thermostat",
            "config": {
              "modes": "off=OFF:WINDOW_OPEN,heat=COMFORT:BOOST:ON,eco=ECO,auto=AUTOMATIC"
            }
          }
        },
        "type": "Group",
        "name": "MyThermostat",
        "label": "My Thermostat",
        "tags": [],
        "groupNames": [],
      },
      {
        "state": "AUTOMATIC",
        "type": "String",
        "name": "MyThermostat_Mode",
        "label": "My Thermostat Mode",
        "tags": [],
        "groupNames": [
          "MyThermostat"
        ],
      },
      {
        "state": "OFF",
        "metadata": {
          "ga": {
            "value": "thermostatMode"
          }
        },
        "type": "String",
        "name": "MyThermostat_RadiatorMode",
        "label": "My Thermostat Mode",
        "tags": [],
        "groupNames": [
          "MyThermostat"
        ],
      },
      {
        "state": "6.0 °C",
        "metadata": {
          "ga": {
            "value": "thermostatTemperatureSetpoint"
          }
        },
        "type": "Number:Temperature",
        "name": "MyThermostat_SetpointTemperature",
        "label": "My Thermostat Setpoint Temperature",
        "tags": [],
        "groupNames": [
          "MyThermostat"
        ],
      },
      {
        "state": "22.5 °C",
        "metadata": {
          "ga": {
            "value": "thermostatTemperatureAmbient"
          }
        },
        "type": "Number:Temperature",
        "name": "MyThermostat_CurrentTemperature",
        "label": "My Thermostat Current Temperature",
        "tags": [],
        "groupNames": [
          "MyThermostat"
        ],
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
  test('Switch Device', async () => {
    const item =
    {
      "state": "OFF",
      "type": "Switch",
      "name": "MySwitch",
      "metadata": {
        "ga": {
          "value": "Switch"
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

  test('Inverted Switch Device', async () => {
    const item =
    {
      "state": "OFF",
      "type": "Switch",
      "name": "MySwitch",
      "metadata": {
        "ga": {
          "value": "Switch",
          "config": {
            "inverted": true
          }
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
          "on": true,
          "online": true,
        },
      },
    });
  });

  test('Lock Device as Contact', async () => {
    const item =
    {
      "state": "CLOSED",
      "type": "Contact",
      "name": "MyLock",
      "metadata": {
        "ga": {
          "value": "Lock"
        }
      }
    };

    const getItemMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve(item));

    const apiHandler = {
      getItem: getItemMock
    };

    const payload = await new OpenHAB(apiHandler).handleQuery([{
      "id": "MyLock"
    }]);

    expect(getItemMock).toHaveBeenCalledTimes(1);
    expect(payload).toStrictEqual({
      "devices": {
        "MyLock": {
          "isLocked": true,
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

  test('Blinds as Rollershutter Device', async () => {
    const item =
    {
      "state": "20",
      "type": "Rollershutter",
      "name": "MyBlinds",
      "metadata": {
        "ga": {
          "value": "Blinds"
        }
      }
    };

    const getItemMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve(item));

    const apiHandler = {
      getItem: getItemMock
    };

    const payload = await new OpenHAB(apiHandler).handleQuery([{
      "id": "MyBlinds"
    }]);

    expect(getItemMock).toHaveBeenCalledTimes(1);
    expect(payload).toStrictEqual({
      "devices": {
        "MyBlinds": {
          "openPercent": 80,
          "online": true,
        },
      },
    });
  });

  test('Inverted Blinds as Rollershutter Device', async () => {
    const item =
    {
      "state": "20",
      "type": "Rollershutter",
      "name": "MyBlinds",
      "metadata": {
        "ga": {
          "value": "Blinds",
          "config": {
            "inverted": true
          }
        }
      }
    };

    const getItemMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve(item));

    const apiHandler = {
      getItem: getItemMock
    };

    const payload = await new OpenHAB(apiHandler).handleQuery([{
      "id": "MyBlinds"
    }]);

    expect(getItemMock).toHaveBeenCalledTimes(1);
    expect(payload).toStrictEqual({
      "devices": {
        "MyBlinds": {
          "openPercent": 20,
          "online": true,
        },
      },
    });
  });

  test('Blinds as Switch Device', async () => {
    const item =
    {
      "state": "OFF",
      "type": "Switch",
      "name": "MyBlinds",
      "metadata": {
        "ga": {
          "value": "Blinds"
        }
      }
    };

    const getItemMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve(item));

    const apiHandler = {
      getItem: getItemMock
    };

    const payload = await new OpenHAB(apiHandler).handleQuery([{
      "id": "MyBlinds"
    }]);

    expect(getItemMock).toHaveBeenCalledTimes(1);
    expect(payload).toStrictEqual({
      "devices": {
        "MyBlinds": {
          "openPercent": 0,
          "online": true,
        },
      },
    });
  });

  test('Window as Contact', async () => {
    const item =
    {
      "state": "CLOSED",
      "type": "Contact",
      "name": "MyWindow",
      "metadata": {
        "ga": {
          "value": "Window"
        }
      }
    };

    const getItemMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve(item));

    const apiHandler = {
      getItem: getItemMock
    };

    const payload = await new OpenHAB(apiHandler).handleQuery([{
      "id": "MyWindow"
    }]);

    expect(getItemMock).toHaveBeenCalledTimes(1);
    expect(payload).toStrictEqual({
      "devices": {
        "MyWindow": {
          "openPercent": 0,
          "online": true,
        },
      },
    });
  });

  test('Fan Device', async () => {
    const item = {
      "state": "50",
      "metadata": {
        "ga": {
          "value": "FAN",
          "config": {
            "ordered": true,
            "speeds": "0\u003dnull:off,50\u003dslow,100\u003dfull:fast",
            "lang": "en"
          }
        }
      },
      "type": "Dimmer",
      "name": "MyFan",
    };
    const getItemMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve(item));

    const apiHandler = {
      getItem: getItemMock
    };

    const payload = await new OpenHAB(apiHandler).handleQuery([{
      "id": "MyFan"
    }]);

    expect(getItemMock).toHaveBeenCalledTimes(1);
    expect(payload).toStrictEqual({
      "devices": {
        "MyFan": {
          "on": true,
          "currentFanSpeedSetting": "50",
          "online": true,
        },
      },
    });
  });

  test('Thermostat Device', async () => {
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
            "useFahrenheit": true,
            "modes": "off=OFF:WINDOW_OPEN,heat=COMFORT:BOOST,eco=ECO,on=ON,auto=AUTOMATIC"
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
        state: 'COMFORT'
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
    getItemMock.mockReturnValue(Promise.resolve(item));

    const apiHandler = {
      getItem: getItemMock
    };

    const payload = await new OpenHAB(apiHandler).handleQuery([{
      "id": "MyThermostat"
    }]);

    expect(getItemMock).toHaveBeenCalledTimes(1);
    expect(payload).toStrictEqual({
      "devices": {
        "MyThermostat": {
          "thermostatHumidityAmbient": 50,
          "thermostatMode": "heat",
          "thermostatTemperatureAmbient": -12.2,
          "thermostatTemperatureSetpoint": -12.2,
          "online": true
        },
      },
    });
  });
});

describe('Test EXECUTE with Metadata', () => {
  test('OnOff with Switch Device', async () => {
    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve());
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "id": "MySwitch"
      }],
      "execution": [{
        "command": "action.devices.commands.OnOff",
        "params": {
          "on": true
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(0);
    expect(sendCommandMock).toBeCalledWith('MySwitch', 'ON');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MySwitch"
        ],
        "states": {
          "online": true,
          "on": true
        },
        "status": "SUCCESS"
      }]
    });
  });

  test('OnOff with Inverted Switch Device', async () => {
    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve());
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "id": "MySwitch",
        "customData": {
          "inverted": true
        }
      }],
      "execution": [{
        "command": "action.devices.commands.OnOff",
        "params": {
          "on": true
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(0);
    expect(sendCommandMock).toBeCalledWith('MySwitch', 'OFF');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MySwitch"
        ],
        "states": {
          "online": true,
          "on": true
        },
        "status": "SUCCESS"
      }]
    });
  });

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
        state: 'heat'
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

  test('ThermostatSetMode invalid', async () => {
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
            "modes": "on=3,heat=5"
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
        name: 'MyMode',
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatMode'
          }
        },
        state: '3'
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
    expect(sendCommandMock).toHaveBeenCalledTimes(0);
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyThermostat"
        ],
        "errorCode": "notSupported",
        "status": "ERROR"
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
          "value": "Thermostat",
          "config": {
            "modes": "on=1,off=5"
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
        name: 'MyMode',
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
    expect(sendCommandMock).toBeCalledWith('MyMode', '5');
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

  test('LockUnlock with Lock and required acknowledge', async () => {
    const item =
    {
      "state": "OFF",
      "type": "Switch",
      "name": "MyLock",
      "label": "My Lock",
      "metadata": {
        "ga": {
          "value": "Lock",
          "config": {
            "ackNeeded": true
          }
        }
      },
      "tags": []
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
          "ackNeeded": true
        },
        "id": "MyLock"
      }],
      "execution": [{
        "command": "action.devices.commands.LockUnlock",
        "params": {
          "lock": true
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(1);
    expect(sendCommandMock).toHaveBeenCalledTimes(0);
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyLock"
        ],
        "states": {
          "online": true,
          "isLocked": true
        },
        "status": "ERROR",
        "errorCode": "challengeNeeded",
        "challengeNeeded": {
          "type": "ackNeeded",
        }
      }]
    });
  });

  test('LockUnlock with Lock and acknowledged challenge', async () => {
    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve());
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "customData": {
          "ackNeeded": true
        },
        "id": "MyLock"
      }],
      "execution": [{
        "command": "action.devices.commands.LockUnlock",
        "params": {
          "lock": true
        },
        "challenge": {
          "ack": true
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(0);
    expect(sendCommandMock).toBeCalledWith('MyLock', 'ON');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyLock"
        ],
        "states": {
          "online": true,
          "isLocked": true
        },
        "status": "SUCCESS"
      }]
    });
  });

  test('LockUnlock with Lock inverted', async () => {
    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve());
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "customData": {
          "inverted": true
        },
        "id": "MyLock"
      }],
      "execution": [{
        "command": "action.devices.commands.LockUnlock",
        "params": {
          "lock": true
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(0);
    expect(sendCommandMock).toBeCalledWith('MyLock', 'OFF');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyLock"
        ],
        "states": {
          "online": true,
          "isLocked": true
        },
        "status": "SUCCESS"
      }]
    });
  });

  test('LockUnlock with Lock as Contact', async () => {
    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve());
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "customData": {
          "itemType": "Contact"
        },
        "id": "MyLock"
      }],
      "execution": [{
        "command": "action.devices.commands.LockUnlock",
        "params": {
          "lock": true
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(0);
    expect(sendCommandMock).toHaveBeenCalledTimes(0);
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyLock"
        ],
        "status": "ERROR",
        "errorCode": "notSupported"
      }]
    });
  });

  test('OpenClose with OpenCloseDevice as Contact', async () => {
    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve());
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "customData": {
          "itemType": "Contact"
        },
        "id": "MyLock"
      }],
      "execution": [{
        "command": "action.devices.commands.OpenClose",
        "params": {
          "openPercent": 0
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(0);
    expect(sendCommandMock).toHaveBeenCalledTimes(0);
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyLock"
        ],
        "status": "ERROR",
        "errorCode": "notSupported"
      }]
    });
  });

  test('BrightnessAbsolute with required acknowledge', async () => {
    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve());
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "customData": {
          "ackNeeded": true
        },
        "id": "MyLight"
      }],
      "execution": [{
        "command": "action.devices.commands.BrightnessAbsolute",
        "params": {
          "brightness": 30
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(0);
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyLight"
        ],
        "states": {
          "online": true,
          "brightness": 30
        },
        "status": "ERROR",
        "errorCode": "challengeNeeded",
        "challengeNeeded": {
          "type": "ackNeeded",
        }
      }]
    });
  });

  test('Arm with required pin', async () => {
    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve());
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "customData": {
          "pinNeeded": "1234"
        },
        "id": "MyAlarm"
      }],
      "execution": [{
        "command": "action.devices.commands.ArmDisarm",
        "params": {
          arm: true
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(0);
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyAlarm"
        ],
        "status": "ERROR",
        "errorCode": "challengeNeeded",
        "challengeNeeded": {
          "type": "pinNeeded",
        }
      }]
    });
  });

  test('Arm with wrong pin', async () => {
    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve());
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "customData": {
          "pinNeeded": "1234"
        },
        "id": "MyAlarm"
      }],
      "execution": [{
        "command": "action.devices.commands.ArmDisarm",
        "params": {
          "arm": true
        },
        "challenge": {
          "pin": "3456"
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(0);
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyAlarm"
        ],
        "status": "ERROR",
        "errorCode": "challengeNeeded",
        "challengeNeeded": {
          "type": "challengeFailedPinNeeded"
        }
      }]
    });
  });

  test('Arm with correct pin', async () => {
    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve());
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "customData": {
          "pinNeeded": "1234"
        },
        "id": "MyAlarm"
      }],
      "execution": [{
        "command": "action.devices.commands.ArmDisarm",
        "params": {
          "arm": true
        },
        "challenge": {
          "pin": "1234"
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(0);
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyAlarm"
        ],
        "states": {
          "online": true,
          "isArmed": true
        },
        "status": "SUCCESS"
      }]
    });
  });

  test('OpenClose Blinds Group as Rollershutter', async () => {
    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve());
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "id": "MyBlinds",
        "customData": {
          "itemType": "Rollershutter"
        }
      }],
      "execution": [{
        "command": "action.devices.commands.OpenClose",
        "params": {
          "openPercent": 0
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(0);
    expect(sendCommandMock).toBeCalledWith('MyBlinds', 'DOWN');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyBlinds"
        ],
        "states": {
          "online": true,
          "openPercent": 0
        },
        "status": "SUCCESS"
      }]
    });
  });

  test('OpenClose Blinds Group as Switch', async () => {
    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve());
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "id": "MyBlinds",
        "customData": {
          "itemType": "Switch"
        }
      }],
      "execution": [{
        "command": "action.devices.commands.OpenClose",
        "params": {
          "openPercent": 0
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(0);
    expect(sendCommandMock).toBeCalledWith('MyBlinds', 'OFF');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyBlinds"
        ],
        "states": {
          "online": true,
          "openPercent": 0
        },
        "status": "SUCCESS"
      }]
    });
  });


  test('SelectChannel with Number for TV', async () => {
    const item =
    {
      "state": "NULL",
      "type": "Group",
      "name": "MyTV",
      "label": "TV",
      "metadata": {
        "ga": {
          "value": "TV",
          "config": {
            "availableChannels": "20=channel1=Channel 1:Kanal 1,10=channel2=Channel 2:Kanal 2"
          }
        }
      },
      "members": [{
        type: 'Number',
        name: 'MyChannel',
        metadata: {
          ga: {
            value: 'channel'
          }
        },
        state: '10'
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
        "id": "MyTV"
      }],
      "execution": [{
        "command": "action.devices.commands.selectChannel",
        "params": {
          "channelNumber": "20"
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(1);
    expect(sendCommandMock).toBeCalledWith('MyChannel', '20');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyTV"
        ],
        "states": {
          'channelNumber': '20',
          'online': true
        },
        "status": "SUCCESS"
      }]
    });
  });

  test('SelectChannel with Name for TV', async () => {
    const item =
    {
      "state": "NULL",
      "type": "Group",
      "name": "MyTV",
      "label": "TV",
      "metadata": {
        "ga": {
          "value": "TV",
          "config": {
            "availableChannels": "20=channel1=Channel 1:Kanal 1,10=channel2=Channel 2:Kanal 2"
          }
        }
      },
      "members": [{
        type: 'Number',
        name: 'MyChannel',
        metadata: {
          ga: {
            value: 'channel'
          }
        },
        state: '10'
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
        "id": "MyTV"
      }],
      "execution": [{
        "command": "action.devices.commands.SelectChannel",
        "params": {
          "channelName": "Channel 1"
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(1);
    expect(sendCommandMock).toBeCalledWith('MyChannel', '20');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyTV"
        ],
        "states": {
          'channelNumber': '20',
          'online': true
        },
        "status": "SUCCESS"
      }]
    });
  });

  test('SelectInput for TV', async () => {
    const item =
    {
      "state": "NULL",
      "type": "Group",
      "name": "MyTV",
      "label": "TV",
      "metadata": {
        "ga": {
          "value": "TV",
          "config": {
            "availableInputs": "tv=TV,hdmi1=HDMI1,hdmi2=HDMI2"
          }
        }
      },
      "members": [{
        type: 'String',
        name: 'MyInput',
        metadata: {
          ga: {
            value: 'input'
          }
        },
        state: 'tv'
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
        "id": "MyTV"
      }],
      "execution": [{
        "command": "action.devices.commands.SetInput",
        "params": {
          "newInput": "hdmi1"
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(1);
    expect(sendCommandMock).toBeCalledWith('MyInput', 'hdmi1');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyTV"
        ],
        "states": {
          'currentInput': 'hdmi1',
          'online': true
        },
        "status": "SUCCESS"
      }]
    });
  });

  test('SetVolume for TV', async () => {
    const item =
    {
      "state": "NULL",
      "type": "Group",
      "name": "MyTV",
      "label": "TV",
      "metadata": {
        "ga": {
          "value": "TV"
        }
      },
      "members": [{
        type: 'Dimmer',
        name: 'MyVolume',
        metadata: {
          ga: {
            value: 'volume'
          }
        },
        state: '40'
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
        "id": "MyTV"
      }],
      "execution": [{
        "command": "action.devices.commands.setVolume",
        "params": {
          "volumeLevel": 10
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(1);
    expect(sendCommandMock).toBeCalledWith('MyVolume', '10');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyTV"
        ],
        "states": {
          'currentVolume': 10,
          'isMuted': false,
          'online': true
        },
        "status": "SUCCESS"
      }]
    });
  });

  test('MediaPause for TV', async () => {
    const item =
    {
      "state": "NULL",
      "type": "Group",
      "name": "MyTV",
      "label": "TV",
      "metadata": {
        "ga": {
          "value": "TV"
        }
      },
      "members": [{
        type: 'Player',
        name: 'MyTransport',
        metadata: {
          ga: {
            value: 'transport'
          }
        },
        state: 'PLAY'
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
        "id": "MyTV"
      }],
      "execution": [{
        "command": "action.devices.commands.mediaPause"
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(1);
    expect(sendCommandMock).toBeCalledWith('MyTransport', 'PAUSE');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyTV"
        ],
        "states": {
        },
        "status": "SUCCESS"
      }]
    });
  });
});

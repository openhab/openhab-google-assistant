
const OpenHAB = require('../functions/openhab.js').OpenHAB;

describe('Test SYNC', () => {
  test('light items', async () => {
    const items = [
      {
        "link": "https://openhab.example.org/rest/items/MySwitch",
        "state": "OFF",
        "type": "Switch",
        "name": "MySwitch",
        "label": "SwitchLight",
        "tags": [
          "Lighting"
        ],
        "groupNames": []
      },
      {
        "link": "https://openhab.example.org/rest/items/MyDimmer",
        "state": "0",
        "type": "Dimmer",
        "name": "MyDimmer",
        "label": "DimmLight",
        "tags": [
          "Lighting"
        ],
        "groupNames": []
      },
      {
        "link": "https://openhab.example.org/rest/items/MyLight",
        "state": "0,0,0",
        "type": "Color",
        "name": "MyLight",
        "label": "ColorLight",
        "tags": [
          "Lighting"
        ],
        "groupNames": []
      },
      {
        "members": [],
        "link": "https://openhab.example.org/rest/items/MyLightGroup",
        "state": "NULL",
        "type": "Group",
        "groupType": "Switch",
        "name": "MyLightGroup",
        "label": "GroupLight",
        "tags": [
          "Lighting"
        ],
        "groupNames": []
      },
      {
        "members": [],
        "link": "https://openhab.example.org/rest/items/MyDimmerGroup",
        "state": "NULL",
        "type": "Group",
        "groupType": "Dimmer",
        "name": "MyDimmerGroup",
        "label": "GroupDimmer",
        "tags": [
          "Lighting"
        ],
        "groupNames": []
      },
      {
        "members": [],
        "link": "https://openhab.example.org/rest/items/MyColorGroup",
        "state": "NULL",
        "type": "Group",
        "groupType": "Color",
        "name": "MyColorGroup",
        "label": "GroupColor",
        "tags": [
          "Lighting"
        ],
        "groupNames": []
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

describe('Test QUERY', () => {
  test('single light item', async () => {
    const item =
    {
      "link": "https://openhab.example.org/rest/items/MySwitch",
      "state": "OFF",
      "type": "Switch",
      "name": "MySwitch",
      "label": "SwitchLight",
      "tags": [
        "Lighting"
      ],
      "groupNames": []
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

  test('multiple light items', async () => {
    const item1 =
    {
      "link": "https://openhab.example.org/rest/items/MySwitch",
      "state": "OFF",
      "type": "Switch",
      "name": "MySwitch",
      "label": "SwitchLight",
      "tags": [
        "Lighting"
      ],
      "groupNames": []
    };

    const item2 =
    {
      "link": "https://openhab.example.org/rest/items/MyDimmer",
      "state": "20",
      "type": "Dimmer",
      "name": "MyDimmer",
      "label": "DimmerLight",
      "tags": [
        "Lighting"
      ],
      "groupNames": []
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

describe('Test EXECUTE', () => {
  test('ThermostatTemperatureSetpoint tag', async () => {
    const item =
    {
      "link": "https://openhab.example.org/rest/items/MyThermostat",
      "state": "NULL",
      "type": "Group",
      "name": "MyThermostat",
      "label": "Thermostat",
      "tags": [
        "Thermostat",
        "Fahrenheit"
      ],
      "members": [{
        type: 'Number',
        tags: [
          'CurrentTemperature'
        ],
        state: '10'
      }, {
        name: 'MyTargetTemperature',
        type: 'Number',
        tags: [
          'TargetTemperature'
        ],
        state: '10'
      }, {
        type: 'Number',
        tags: [
          'HeatingCoolingMode'
        ],
        state: '1'
      }, {
        type: 'Number',
        tags: [
          'CurrentHumidity'
        ],
        state: '50'
      }],
      "groupNames": []
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

  test('ThermostatTemperatureSetpoint metadata', async () => {
    const item =
    {
      "link": "https://openhab.example.org/rest/items/MyThermostat",
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
      }],
      "groupNames": []
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

  test('ThermostatSetMode metadata', async () => {
    const item =
    {
      "link": "https://openhab.example.org/rest/items/MyThermostat",
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
      }],
      "groupNames": []
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

  test('OpenClose Rollershutter', async () => {
    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "customData": {
          "itemType": "Rollershutter"
        },
        "id": "MyRollershutter"
      }],
      "execution": [{
        "command": "action.devices.commands.OpenClose",
        "params": {
          "openPercent": 0
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).not.toHaveBeenCalled();
    expect(sendCommandMock).toBeCalledWith('MyRollershutter', 'DOWN');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyRollershutter"
        ],
        "states": {
          "online": true,
          "openPercent": 0
        },
        "status": "SUCCESS"
      }]
    });
  });


  test('OpenClose Rollershutter inverted', async () => {
    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "customData": {
          "itemType": "Rollershutter",
          "inverted": true
        },
        "id": "MyRollershutter"
      }],
      "execution": [{
        "command": "action.devices.commands.OpenClose",
        "params": {
          "openPercent": 0
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).not.toHaveBeenCalled();
    expect(sendCommandMock).toBeCalledWith('MyRollershutter', 'UP');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyRollershutter"
        ],
        "states": {
          "online": true,
          "openPercent": 0
        },
        "status": "SUCCESS"
      }]
    });
  });

  test('OpenClose Switch', async () => {
    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "customData": {
          "itemType": "Switch"
        },
        "id": "MyRollershutter"
      }],
      "execution": [{
        "command": "action.devices.commands.OpenClose",
        "params": {
          "openPercent": 0
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).not.toHaveBeenCalled();
    expect(sendCommandMock).toBeCalledWith('MyRollershutter', 'OFF');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyRollershutter"
        ],
        "states": {
          "online": true,
          "openPercent": 0
        },
        "status": "SUCCESS"
      }]
    });
  });

  test('ColorAbsolute HSV', async () => {
    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "id": "MyColor"
      }],
      "execution": [{
        "command": "action.devices.commands.ColorAbsolute",
        "params": {
          "color": {
            "spectrumHSV": {
              "hue": 240.0,
              "saturation": 1.0,
              "value": 1.0
            }
          }
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).not.toHaveBeenCalled();
    expect(sendCommandMock).toBeCalledWith('MyColor', '240,100,100');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyColor"
        ],
        "states": {
          "online": true,
          "color": {
            "spectrumHsv": {
              "hue": 240.0,
              "saturation": 1.0,
              "value": 1.0
            }
          }
        },
        "status": "SUCCESS"
      }]
    });
  });

  test('ColorAbsolute Temperature', async () => {
    const item =
    {
      "link": "https://openhab.example.org/rest/items/MyColor",
      "state": "50,50,50",
      "type": "Switch",
      "name": "MyColor",
      "label": "ColorLight",
      "metadata": {
        "ga": {
          "value": "LIGHT"
        }
      },
      "groupNames": []
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
        "id": "MyColor"
      }],
      "execution": [{
        "command": "action.devices.commands.ColorAbsolute",
        "params": {
          "color": {
            "temperature": 4000
          }
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalled();
    expect(sendCommandMock).toBeCalledWith('MyColor', '26.97,34.9,50');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyColor"
        ],
        "states": {
          "online": true,
          "color": {
            "temperatureK": 4000
          }
        },
        "status": "SUCCESS"
      }]
    });
  });
});

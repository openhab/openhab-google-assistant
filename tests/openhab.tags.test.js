
const OpenHAB = require('../functions/openhab.js').OpenHAB;

describe('Test SYNC with Tags', () => {
  test('Light Devices', async () => {
    const items = [
      {
        "state": "OFF",
        "type": "Switch",
        "name": "MySwitch",
        "label": "SwitchLight",
        "tags": [
          "Lighting"
        ]
      },
      {
        "state": "0",
        "type": "Dimmer",
        "name": "MyDimmer",
        "label": "DimmLight",
        "tags": [
          "Lighting"
        ]
      },
      {
        "state": "0,0,0",
        "type": "Color",
        "name": "MyLight",
        "label": "ColorLight",
        "tags": [
          "Lighting"
        ]
      },
      {
        "members": [],
        "state": "NULL",
        "type": "Group",
        "groupType": "Switch",
        "name": "MyLightGroup",
        "label": "GroupLight",
        "tags": [
          "Lighting"
        ]
      },
      {
        "members": [],
        "state": "NULL",
        "type": "Group",
        "groupType": "Dimmer",
        "name": "MyDimmerGroup",
        "label": "GroupDimmer",
        "tags": [
          "Lighting"
        ]
      },
      {
        "members": [],
        "state": "NULL",
        "type": "Group",
        "groupType": "Color",
        "name": "MyColorGroup",
        "label": "GroupColor",
        "tags": [
          "Lighting"
        ]
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

describe('Test QUERY with Tags', () => {
  test('Single Light Device ', async () => {
    const item =
    {
      "state": "OFF",
      "type": "Switch",
      "name": "MySwitch",
      "tags": [
        "Lighting"
      ]
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
      "tags": [
        "Lighting"
      ]
    };

    const item2 =
    {
      "state": "20",
      "type": "Dimmer",
      "name": "MyDimmer",
      "tags": [
        "Lighting"
      ]
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

describe('Test EXECUTE with Tags', () => {
  test('ThermostatTemperatureSetpoint', async () => {
    const item =
    {
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
        type: 'String',
        tags: [
          'HeatingCoolingMode'
        ],
        state: 'heat'
      }, {
        type: 'Number',
        tags: [
          'CurrentHumidity'
        ],
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

  test('ThermostatSetModeCommand', async () => {
    const item =
    {
      "state": "NULL",
      "type": "Group",
      "name": "MyThermostat",
      "label": "Thermostat",
      "tags": [
        "Thermostat"
      ],
      "members": [{
        type: 'Number',
        tags: [
          'CurrentTemperature'
        ],
        state: '10'
      }, {
        type: 'Number',
        tags: [
          'TargetTemperature'
        ],
        state: '10'
      }, {
        name: 'MyHeatingCoolingMode',
        type: 'String',
        tags: [
          'HeatingCoolingMode'
        ],
        state: 'cool'
      }, {
        type: 'Number',
        tags: [
          'CurrentHumidity'
        ],
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
          "thermostatMode": "heat"
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(1);
    expect(sendCommandMock).toBeCalledWith('MyHeatingCoolingMode', 'heat');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MyThermostat"
        ],
        "states": {
          "online": true,
          "thermostatHumidityAmbient": 50,
          "thermostatMode": "heat",
          "thermostatTemperatureAmbient": 10,
          "thermostatTemperatureSetpoint": 10
        },
        "status": "SUCCESS"
      }]
    });
  });
});

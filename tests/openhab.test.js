const OpenHAB = require('../functions/openhab.js');

describe('Test EXECUTE', () => {
  test('OnOff Switch', async () => {
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
        "id": "MySwitch"
      }],
      "execution": [{
        "command": "action.devices.commands.OnOff",
        "params": {
          "on": false
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).not.toHaveBeenCalled();
    expect(sendCommandMock).toBeCalledWith('MySwitch', 'OFF');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MySwitch"
        ],
        "states": {
          "online": true,
          "on": false
        },
        "status": "SUCCESS"
      }]
    });
  });

  test('setVolume Dimmer', async () => {
    const item =
    {
      "state": "10",
      "type": "Dimmer",
      "name": "MySpeaker",
      "metadata": {
        "ga": {
          "value": "Speaker"
        }
      }
    };

    const getItemMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve(item));

    const sendCommandMock = jest.fn();
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "customData": {
          "itemType": "Dimmer"
        },
        "id": "MySpeaker"
      }],
      "execution": [{
        "command": "action.devices.commands.setVolume",
        "params": {
          "volumeLevel": 40
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(1);
    expect(sendCommandMock).toBeCalledWith('MySpeaker', '40');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MySpeaker"
        ],
        "states": {
          "currentVolume": 40,
          "isMuted": false,
          "online": true
        },
        "status": "SUCCESS"
      }]
    });
  });

  test('volumeRelative Dimmer', async () => {
    const item =
    {
      "state": "40",
      "type": "Dimmer",
      "name": "MySpeaker",
      "metadata": {
        "ga": {
          "value": "Speaker"
        }
      }
    };

    const getItemMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve(item));

    const sendCommandMock = jest.fn();
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "customData": {
          "itemType": "Dimmer"
        },
        "id": "MySpeaker"
      }],
      "execution": [{
        "command": "action.devices.commands.volumeRelative",
        "params": {
          "volumeRelativeLevel": 20
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(1);
    expect(sendCommandMock).toBeCalledWith('MySpeaker', '60');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MySpeaker"
        ],
        "states": {
          "currentVolume": 60,
          "isMuted": false,
          "online": true
        },
        "status": "SUCCESS"
      }]
    });
  });


  test('volumeRelative Dimmer max overflow', async () => {
    const item =
    {
      "state": "100",
      "type": "Dimmer",
      "name": "MySpeaker",
      "metadata": {
        "ga": {
          "value": "Speaker"
        }
      }
    };

    const getItemMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve(item));

    const sendCommandMock = jest.fn();
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "customData": {
          "itemType": "Dimmer"
        },
        "id": "MySpeaker"
      }],
      "execution": [{
        "command": "action.devices.commands.volumeRelative",
        "params": {
          "volumeRelativeLevel": 20
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(1);
    expect(sendCommandMock).toBeCalledWith('MySpeaker', '100');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MySpeaker"
        ],
        "states": {
          "currentVolume": 100,
          "isMuted": false,
          "online": true
        },
        "status": "SUCCESS"
      }]
    });
  });

  test('volumeRelative Dimmer min overflow', async () => {
    const item =
    {
      "state": "10",
      "type": "Dimmer",
      "name": "MySpeaker",
      "metadata": {
        "ga": {
          "value": "Speaker"
        }
      }
    };

    const getItemMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve(item));

    const sendCommandMock = jest.fn();
    sendCommandMock.mockReturnValue(Promise.resolve());

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const commands = [{
      "devices": [{
        "customData": {
          "itemType": "Dimmer"
        },
        "id": "MySpeaker"
      }],
      "execution": [{
        "command": "action.devices.commands.volumeRelative",
        "params": {
          "volumeRelativeLevel": -20
        }
      }]
    }];

    const payload = await new OpenHAB(apiHandler).handleExecute(commands);

    expect(getItemMock).toHaveBeenCalledTimes(1);
    expect(sendCommandMock).toBeCalledWith('MySpeaker', '0');
    expect(payload).toStrictEqual({
      "commands": [{
        "ids": [
          "MySpeaker"
        ],
        "states": {
          "currentVolume": 0,
          "isMuted": true,
          "online": true
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
      "state": "50,50,50",
      "type": "Switch",
      "name": "MyColor",
      "label": "ColorLight",
      "metadata": {
        "ga": {
          "value": "LIGHT"
        }
      }
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

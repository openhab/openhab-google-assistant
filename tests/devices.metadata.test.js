const Devices = require('../functions/devices.js');
const Thermostat = require('../functions/devices/thermostat.js');
const TV = require('../functions/devices/tv.js');

describe('Test Switch Devices with Metadata', () => {
  test('Switch Type', () => {
    const item = {
      type: 'Switch',
      state: 'ON',
      metadata: {
        ga: {
          value: 'Switch'
        }
      }
    };
    const device = Devices.getDeviceForItem(item);
    expect(device.name).toBe('Switch');
    expect(device.getState(item)).toStrictEqual({
      on: true
    });
  });

  test('Inverted Switch Type', () => {
    const item = {
      type: 'Switch',
      state: 'ON',
      metadata: {
        ga: {
          value: 'Switch',
          config: {
            inverted: true
          }
        }
      }
    };
    const device = Devices.getDeviceForItem(item);
    expect(device.name).toBe('Switch');
    expect(device.getState(item)).toStrictEqual({
      on: false
    });
  });

  test('Valve Switch Type', () => {
    const item = {
      type: 'Switch',
      state: 'ON',
      metadata: {
        ga: {
          value: 'Valve'
        }
      }
    };
    const device = Devices.getDeviceForItem(item);
    expect(device.name).toBe('Valve');
    expect(device.getState(item)).toStrictEqual({
      openPercent: 100
    });
  });

  test('Sprinkler Switch Type', () => {
    const item = {
      type: 'Switch',
      state: 'ON',
      metadata: {
        ga: {
          value: 'Sprinkler'
        }
      }
    };
    const device = Devices.getDeviceForItem(item);
    expect(device.name).toBe('Sprinkler');
    expect(device.getState(item)).toStrictEqual({
      isRunning: true,
      isPaused: false
    });
  });

  test('Lock Switch Type', () => {
    const item = {
      type: 'Switch',
      state: 'ON',
      metadata: {
        ga: {
          value: 'Lock',
          config: {
            ackNeeded: true
          }
        }
      }
    };
    const device = Devices.getDeviceForItem(item);
    expect(device.name).toBe('Lock');
    expect(device.getMetadata(item).customData.ackNeeded).toBe(true);
    expect(device.getMetadata(item).customData.pinNeeded).toBeUndefined();
    expect(device.getState(item)).toStrictEqual({
      isLocked: true
    });
  });

  test('SecuritySystem Switch Type', () => {
    const item = {
      type: 'Switch',
      state: 'ON',
      metadata: {
        ga: {
          value: 'SecuritySystem',
          config: {
            pinNeeded: '1234'
          }
        }
      }
    };
    const device = Devices.getDeviceForItem(item);
    expect(device.name).toBe('SecuritySystem');
    expect(device.getMetadata(item).customData.ackNeeded).toBeUndefined();
    expect(device.getMetadata(item).customData.pinNeeded).toBe('1234');
    expect(device.getState(item)).toStrictEqual({
      isArmed: true
    });
  });
});

describe('Test Light Devices with Metadata', () => {
  test('Switch Light Type', () => {
    const item = {
      type: 'Switch',
      state: 'ON',
      metadata: {
        ga: {
          value: 'LIGHT'
        }
      }
    };
    const device = Devices.getDeviceForItem(item);
    expect(device.name).toBe('SimpleLight');
    expect(device.getAttributes(item)).toStrictEqual({});
    expect(device.getState(item)).toStrictEqual({
      on: true
    });
  });

  test('Dimmer Light Type', () => {
    const item = {
      type: 'Dimmer',
      state: '40',
      metadata: {
        ga: {
          value: 'LIGHT'
        }
      }
    };
    const device = Devices.getDeviceForItem(item);
    expect(device.name).toBe('DimmableLight');
    expect(device.getAttributes(item)).toStrictEqual({});
    expect(device.getState(item)).toStrictEqual({
      brightness: 40,
      on: true
    });
  });

  test('Color Light Type', () => {
    const item = {
      type: 'Color',
      state: '100,50,20',
      metadata: {
        ga: {
          value: 'LIGHT'
        }
      }
    };
    const device = Devices.getDeviceForItem(item);
    expect(device.name).toBe('ColorLight');
    expect(device.getAttributes(item)).toStrictEqual({
      colorModel: 'hsv'
    });
    expect(device.getState(item)).toStrictEqual({
      brightness: 20,
      color: {
        spectrumHSV: {
          hue: 100,
          saturation: 0.5,
          value: 0.2,
        },
      },
      on: true
    });
  });

  test('Color Light Type colorTemperatureRange', () => {
    const item = {
      type: 'Color',
      metadata: {
        ga: {
          value: 'LIGHT',
          config: {
            colorTemperatureRange: '1000,4000'
          }
        }
      },
      state: '100,50,20'
    };
    const device = Devices.getDeviceForItem(item);
    expect(device.name).toBe('ColorLight');
    expect(device.getAttributes(item)).toStrictEqual({
      colorModel: 'hsv',
      colorTemperatureRange: {
        temperatureMinK: 1000,
        temperatureMaxK: 4000
      }
    });
    expect(device.getState(item)).toStrictEqual({
      brightness: 20,
      color: {
        spectrumHSV: {
          hue: 100,
          saturation: 0.5,
          value: 0.2,
        }
      },
      on: true
    });
  });

  test('Color Light Type colorTemperatureRange with invalid value', () => {
    const item = {
      type: 'Color',
      metadata: {
        ga: {
          value: 'LIGHT',
          config: {
            colorTemperatureRange: 'a,b'
          }
        }
      }
    };
    const device = Devices.getDeviceForItem(item);
    expect(device.name).toBe('ColorLight');
    expect(device.getAttributes(item)).toStrictEqual({
      colorModel: 'hsv'
    });
  });

  test('Special Color Light Type', () => {
    const item = {
      type: 'Group',
      metadata: {
        ga: {
          value: 'LIGHT',
          config: {
            colorTemperatureRange: '1000,4000'
          }
        }
      },
      members: [{
        name: 'Brightness',
        type: 'Dimmer',
        metadata: {
          ga: {
            value: 'lightBrightness'
          }
        },
        state: '10'
      }, {
        name: 'ColorTemp',
        type: 'Dimmer',
        metadata: {
          ga: {
            value: 'lightColorTemperature'
          }
        },
        state: '50'
      }]
    };
    const device = Devices.getDeviceForItem(item);
    expect(device.name).toBe('SpecialColorLight');
    expect(device.getAttributes(item)).toStrictEqual({
      colorTemperatureRange: {
        temperatureMinK: 1000,
        temperatureMaxK: 4000
      }
    });
    expect(device.getState(item)).toStrictEqual({
      brightness: 10,
      color: {
        temperatureK: 2500
      },
      on: true
    });
  });
});

describe('Test OpenClose Devices', () => {
  test('Invalid Blinds Type', () => {
    expect(Devices.getDeviceForItem({
      type: 'Dimmer',
      metadata: {
        ga: {
          value: 'BLINDS'
        }
      }
    })).toBe(undefined);
  });

  test('Blinds Rollershutter Type', () => {
    const item = {
      type: 'Rollershutter',
      state: '0',
      metadata: {
        ga: {
          value: 'BLINDS'
        }
      }
    };
    const device = Devices.getDeviceForItem(item);
    expect(device.name).toBe('Blinds');
    expect(device.getAttributes(item)).toStrictEqual({
      discreteOnlyOpenClose: false,
      queryOnlyOpenClose: false
    });
    expect(device.getState(item)).toStrictEqual({
      openPercent: 100
    });
  });

  test('Blinds Rollershutter Type Inverted', () => {
    const item = {
      type: 'Rollershutter',
      state: '0',
      metadata: {
        ga: {
          value: 'BLINDS',
          config: {
            inverted: true,
            discreteOnlyOpenClose: true
          }
        }
      }
    };
    const device = Devices.getDeviceForItem(item);
    expect(device.name).toBe('Blinds');
    expect(device.getAttributes(item)).toStrictEqual({
      discreteOnlyOpenClose: true,
      queryOnlyOpenClose: false
    });
    expect(device.getState(item)).toStrictEqual({
      openPercent: 0
    });
  });

  test('Window as Contact', () => {
    const item = {
      type: 'Contact',
      state: 'OPEN',
      metadata: {
        ga: {
          value: 'WINDOW'
        }
      }
    };
    const device = Devices.getDeviceForItem(item);
    expect(device.name).toBe('Window');
    expect(device.getAttributes(item)).toStrictEqual({
      discreteOnlyOpenClose: true,
      queryOnlyOpenClose: true
    });
    expect(device.getState(item)).toStrictEqual({
      openPercent: 100
    });
  });
});

describe('Test Sensor Device with Metadata', () => {
  const item = {
    type: 'Number',
    metadata: {
      ga: {
        value: 'Sensor',
        config: {
          sensorName: 'MySensor',
          valueUnit: 'Percent',
          states: 'off=0,low=50,high=100'
        }
      }
    },
    state: '100'
  };
  const device = Devices.getDeviceForItem(item);

  test('getAttributes', () => {
    expect(device.getAttributes({
      metadata: {
        ga: {
          value: 'Sensor',
          config: {
            sensorName: 'AirQuality'
          }
        }
      }
    })).toStrictEqual({
      'sensorStatesSupported': {
        'name': 'AirQuality'
      }
    });

    expect(device.getAttributes({
      metadata: {
        ga: {
          value: 'Sensor',
          config: {
            sensorName: 'MySensor',
            valueUnit: 'Percent'
          }
        }
      }
    })).toStrictEqual({
      'sensorStatesSupported': {
        'name': 'MySensor',
        'numericCapabilities': {
          'rawValueUnit': 'Percent'
        }
      }
    });

    expect(device.getAttributes({
      metadata: {
        ga: {
          value: 'Sensor',
          config: {
            sensorName: 'MySensor',
            states: 'off=0,low=50,high=100'
          }
        }
      }
    })).toStrictEqual({
      'sensorStatesSupported': {
        'name': 'MySensor',
        'descriptiveCapabilities': {
          'availableStates': ['off', 'low', 'high']
        }
      }
    });
  });

  test('translateModeToGoogle', () => {
    expect(device.name).toBe('Sensor');
    expect(device.translateStateToGoogle(item)).toBe('high');
  });

  test('getState', () => {
    expect(device.getState(item)).toStrictEqual({
      "currentSensorStateData": {
        "currentSensorState": "high",
        "name": "MySensor",
        "rawValue": 100,
      }
    });
  });
});

describe('Test Thermostat Device with Metadata', () => {
  test('getDeviceForItem', () => {
    expect(Devices.getDeviceForItem({
      type: 'Group',
      metadata: {
        ga: {
          value: 'Thermostat'
        }
      }
    }).name).toBe('Thermostat');

    expect(Devices.getDeviceForItem({
      type: 'Switch',
      metadata: {
        ga: {
          value: 'Thermostat'
        }
      }
    })).toBe(undefined);

    expect(Devices.getDeviceForItem({
      type: 'Group',
      metadata: {
        ga: {
          value: 'Something'
        }
      }
    })).toBe(undefined);
  });

  test('usesFahrenheit', () => {
    expect(Thermostat.usesFahrenheit({
      metadata: {
        ga: {
          value: 'Thermostat',
          config: {
            useFahrenheit: true
          }
        }
      }
    })).toBe(true);
  });

  test('getAttributes', () => {
    expect(Thermostat.getAttributes({
      metadata: {
        ga: {
          value: 'Thermostat',
          config: {
            useFahrenheit: true
          }
        }
      }
    })).toStrictEqual({
      availableThermostatModes: 'off,heat,cool,on,heatcool,auto,eco',
      thermostatTemperatureUnit: 'F',
    });

    expect(Thermostat.getAttributes({
      metadata: {
        ga: {
          value: 'Thermostat',
          config: {
            modes: 'on,off'
          }
        }
      }
    })).toStrictEqual({
      availableThermostatModes: 'on,off',
      thermostatTemperatureUnit: 'C',
    });

    expect(Thermostat.getAttributes({
      metadata: {
        ga: {
          value: 'Thermostat',
          config: {
            modes: 'off=OFF:WINDOW_OPEN,heat=COMFORT:BOOST,eco=ECO,on=ON,auto'
          }
        }
      }
    })).toStrictEqual({
      availableThermostatModes: 'off,heat,eco,on,auto',
      thermostatTemperatureUnit: 'C',
    });

    // test thermostatTemperatureRange attribute
    expect(Thermostat.getAttributes({
      metadata: {
        ga: {
          value: 'Thermostat',
          config: {
            thermostatTemperatureRange: '10,30'
          }
        }
      }
    })).toStrictEqual({
      availableThermostatModes: 'off,heat,cool,on,heatcool,auto,eco',
      thermostatTemperatureUnit: 'C',
      thermostatTemperatureRange: {
        minThresholdCelsius: 10.0,
        maxThresholdCelsius: 30.0
      }
    });

    // wrong value for thermostatTemperatureRange should not throw error
    expect(Thermostat.getAttributes({
      metadata: {
        ga: {
          value: 'Thermostat',
          config: {
            thermostatTemperatureRange: '100'
          }
        }
      }
    })).toStrictEqual({
      availableThermostatModes: 'off,heat,cool,on,heatcool,auto,eco',
      thermostatTemperatureUnit: 'C'
    });

    // wrong value for thermostatTemperatureRange should not throw error
    expect(Thermostat.getAttributes({
      metadata: {
        ga: {
          value: 'Thermostat',
          config: {
            thermostatTemperatureRange: 'a,b'
          }
        }
      }
    })).toStrictEqual({
      availableThermostatModes: 'off,heat,cool,on,heatcool,auto,eco',
      thermostatTemperatureUnit: 'C'
    });
  });

  test('getModeMap', () => {
    expect(Thermostat.getModeMap({
      metadata: {
        ga: {
          value: 'Thermostat'
        }
      }
    })).toStrictEqual({
      'off': ['off'],
      'heat': ['heat'],
      'cool': ['cool'],
      'on': ['on'],
      'heatcool': ['heatcool'],
      'auto': ['auto'],
      'eco': ['eco']
    });

    expect(Thermostat.getModeMap({
      metadata: {
        ga: {
          value: 'Thermostat',
          config: {
            modes: 'on,off,heat,cool'
          }
        }
      }
    })).toStrictEqual({
      'on': ['on'],
      'off': ['off'],
      'heat': ['heat'],
      'cool': ['cool']
    });

    expect(Thermostat.getModeMap({
      metadata: {
        ga: {
          value: 'Thermostat',
          config: {
            modes: 'off=OFF:WINDOW_OPEN,heat=COMFORT:BOOST,eco=ECO,on=ON,auto'
          }
        }
      }
    })).toStrictEqual({
      'off': ['OFF', 'WINDOW_OPEN'],
      'heat': ['COMFORT', 'BOOST'],
      'eco': ['ECO'],
      'on': ['ON'],
      'auto': ['auto']
    });
  });

  test('translateModeToGoogle', () => {
    expect(Thermostat.translateModeToGoogle({
      metadata: {
        ga: {
          value: 'Thermostat',
          config: {
            modes: 'off=OFF:WINDOW_OPEN,heat=COMFORT:BOOST,eco=ECO,on=ON,auto'
          }
        }
      }
    }, 'COMFORT')).toBe('heat');

    expect(Thermostat.translateModeToGoogle({
      metadata: {
        ga: {
          value: 'Thermostat',
          config: {
            modes: 'off=OFF:WINDOW_OPEN,heat=COMFORT:BOOST,eco=ECO,on=ON,auto'
          }
        }
      }
    }, 'WINDOW_OPEN')).toBe('off');
  });

  test('translateModeToOpenhab', () => {
    expect(Thermostat.translateModeToOpenhab({
      metadata: {
        ga: {
          value: 'Thermostat',
          config: {
            modes: 'off=OFF:WINDOW_OPEN,heat=COMFORT:BOOST,eco=ECO,on=ON,auto'
          }
        }
      }
    }, 'heat')).toBe('COMFORT');

    expect(Thermostat.translateModeToOpenhab({
      metadata: {
        ga: {
          value: 'Thermostat',
          config: {
            modes: 'off=OFF:WINDOW_OPEN,heat=COMFORT:BOOST,eco=ECO,on=ON,auto'
          }
        }
      }
    }, 'auto')).toBe('auto');
  });

  test('getMetadata', () => {
    expect(Thermostat.getMetadata(
      {
        name: 'MyItem',
        label: 'MyThermostat',
        type: 'Group',
        metadata: {
          ga: {
            value: 'Thermostat',
            config: {
              name: 'My Thermostat',
              modes: 'off=OFF:WINDOW_OPEN,heat=COMFORT:BOOST,eco=ECO,on=ON,auto=AUTOMATIC'
            }
          }
        },
        members: [{
          name: 'Ambient',
          type: 'Number',
          metadata: {
            ga: {
              value: 'thermostatTemperatureAmbient'
            }
          },
          state: '10'
        }, {
          name: 'SetPoint',
          type: 'Number',
          metadata: {
            ga: {
              value: 'thermostatTemperatureSetpoint'
            }
          },
          state: '20'
        }, {
          name: 'Mode',
          type: 'Number',
          metadata: {
            ga: {
              value: 'thermostatMode'
            }
          },
          state: 'off'
        }]
      })).toStrictEqual({
        "attributes": {
          "availableThermostatModes": "off,heat,eco,on,auto",
          "thermostatTemperatureUnit": "C"
        },
        "customData": {
          "deviceType": "Thermostat",
          "itemType": "Group"
        },
        "roomHint": undefined,
        "structureHint": undefined,
        "deviceInfo": {
          "hwVersion": "2.5.0",
          "manufacturer": "openHAB",
          "model": "Group:MyItem",
          "swVersion": "2.5.0",
        },
        "id": "MyItem",
        "name": {
          "defaultNames": [
            "My Thermostat",
          ],
          "name": "My Thermostat",
          "nicknames": [
            "My Thermostat",
          ]
        },
        "traits": [
          "action.devices.traits.TemperatureSetting",
        ],
        "type": "action.devices.types.THERMOSTAT",
        "willReportState": false
      });
  });

  test('getState', () => {
    expect(Thermostat.getState({
      type: 'Group',
      metadata: {
        ga: {
          value: 'Thermostat'
        }
      }
    })).toStrictEqual({});

    expect(Thermostat.getState({
      type: 'Group',
      metadata: {
        ga: {
          value: 'Thermostat',
          config: {
            useFahrenheit: true
          }
        }
      },
      members: [{
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
        state: '20'
      }, {
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatMode'
          }
        },
        state: 'off'
      }]
    })).toStrictEqual({
      'thermostatTemperatureAmbient': -12.2,
      'thermostatTemperatureSetpoint': -6.7,
      'thermostatMode': 'off'
    });

    expect(Thermostat.getState({
      type: 'Group',
      metadata: {
        ga: {
          value: 'Thermostat',
          config: {
            modes: 'heat=1,off=2'
          }
        }
      },
      members: [{
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
        state: '20'
      }, {
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatTemperatureSetpointHigh'
          }
        },
        state: '22'
      }, {
        type: 'Number',
        metadata: {
          ga: {
            value: 'thermostatTemperatureSetpointLow'
          }
        },
        state: '18'
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
    })).toStrictEqual({
      'thermostatTemperatureAmbient': 10,
      'thermostatTemperatureSetpoint': 20,
      'thermostatTemperatureSetpointHigh': 22,
      'thermostatTemperatureSetpointLow': 18,
      'thermostatMode': 'heat',
      'thermostatHumidityAmbient': 50,
    });
  });

  describe('Test TV Device with Metadata', () => {
    test('getAttributes', () => {
      expect(TV.getAttributes({
        metadata: {
          ga: {
            value: 'TV',
            config: {
              availableInputs: 'tv=TV,hdmi1=HDMI1,hdmi2=HDMI2',
              availableChannels: '20=channel1=Channel 1:Kanal 1,10=channel2=Channel 2:Kanal 2'
            }
          }
        }
      })).toStrictEqual({
        "availableInputs": [
          {
            "key": "tv",
            "names": [
              {
                "lang": "en",
                "name_synonym": [
                  "TV",
                ],
              },
            ],
          },
          {
            "key": "hdmi1",
            "names": [
              {
                "lang": "en",
                "name_synonym": [
                  "HDMI1",
                ],
              },
            ],
          },
          {
            "key": "hdmi2",
            "names": [
              {
                "lang": "en",
                "name_synonym": [
                  "HDMI2",
                ],
              },
            ],
          },
        ],
        "orderedInputs": false,
        "availableChannels": [
          {
            "key": "channel1",
            "names": [
              "Channel 1",
              "Kanal 1",
            ],
            "number": "20",
          },
          {
            "key": "channel2",
            "names": [
              "Channel 2",
              "Kanal 2",
            ],
            "number": "10",
          },
        ],
        "transportControlSupportedCommands": [
          "NEXT",
          "PREVIOUS",
          "PAUSE",
          "RESUME",
        ],
      });
    });

    test('getChannelMap', () => {
      expect(TV.getChannelMap({
        metadata: {
          ga: {
            value: 'TV',
            config: {
              availableChannels: '20=channel1=Channel 1:Kanal 1,10=channel2=Channel 2:Kanal 2'
            }
          }
        }
      })).toStrictEqual({
        "10": [
          "Channel 2",
          "Kanal 2",
          "channel2",
        ],
        "20": [
          "Channel 1",
          "Kanal 1",
          "channel1",
        ],
      });
    });

    test('getState', () => {
      expect(TV.getState({
        type: 'Group',
        metadata: {
          ga: {
            value: 'TV'
          }
        }
      })).toStrictEqual({});

      expect(TV.getState({
        type: 'Group',
        metadata: {
          ga: {
            value: 'TV',
            config: {
              availableChannels: '20=channel1=Channel 1:Kanal 1,10=channel2=Channel 2:Kanal 2'
            }
          }
        },
        members: [{
          type: 'Switch',
          metadata: {
            ga: {
              value: 'tvPower'
            }
          },
          state: 'ON'
        }, {
          type: 'Switch',
          metadata: {
            ga: {
              value: 'tvMute'
            }
          },
          state: 'OFF'
        }, {
          type: 'String',
          metadata: {
            ga: {
              value: 'tvInput'
            }
          },
          state: 'tv'
        }, {
          type: 'Number',
          metadata: {
            ga: {
              value: 'tvChannel'
            }
          },
          state: '20'
        }, {
          type: 'Number',
          metadata: {
            ga: {
              value: 'tvVolume'
            }
          },
          state: '50'
        }, {
          type: 'String',
          metadata: {
            ga: {
              value: 'tvTransport'
            }
          },
          state: 'PLAY'
        }]
      })).toStrictEqual({
        'channelName': 'Channel 1',
        'channelNumber': '20',
        'currentInput': 'tv',
        'currentVolume': 50,
        'isMuted': false,
        'on': true
      });
    });
  });
});

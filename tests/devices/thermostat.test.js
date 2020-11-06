const Device = require('../../functions/devices/thermostat.js');

describe('Thermostat Device', () => {
  test('isCompatible', () => {
    expect(Device.isCompatible({
      "metadata": {
        "ga": {
          "value": "THERMOSTAT"
        }
      }
    })).toBe(true);
  });

  test('matchesItemType', () => {
    const item = {
      "type": "Group",
      "members": [
        {
          "metadata": {
            "ga": {
              "value": "thermostatTemperatureAmbient"
            }
          }
        }
      ]
    };
    expect(Device.matchesItemType(item)).toBe(true);
    expect(Device.matchesItemType({ "type": "Group" })).toBe(false);
  });

  describe('useFahrenheit', () => {
    test('useFahrenheit thermostatTemperatureUnit', () => {
      const item = {
        "metadata": {
          "ga": {
            "config": {
              "thermostatTemperatureUnit": "F"
            }
          }
        }
      };
      expect(Device.useFahrenheit(item)).toBe(true);
    });
    test('useFahrenheit useFahrenheit', () => {
      const item = {
        "metadata": {
          "ga": {
            "config": {
              "useFahrenheit": true
            }
          }
        }
      };
      expect(Device.useFahrenheit(item)).toBe(true);
    });
    test('useFahrenheit tag', () => {
      const item = {
        "tags": ["Fahrenheit"]
      };
      expect(Device.useFahrenheit(item)).toBe(true);
    });
  });

  describe('getAttributes', () => {
    test('getAttributes no config', () => {
      const item = {
        "metadata": {
          "ga": {
            "config": {}
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        "availableThermostatModes": ["off", "heat", "cool", "on", "heatcool", "auto", "eco"],
        "thermostatTemperatureUnit": "C"
      });
    });

    test('getAttributes modes, fahrenheit', () => {
      const item = {
        "metadata": {
          "ga": {
            "config": {
              "modes": "on=1,off=2",
              "useFahrenheit": true
            }
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        "availableThermostatModes": ["on", "off"],
        "thermostatTemperatureUnit": "F"
      });
    });

    test('getAttributes temperaturerange', () => {
      const item = {
        "metadata": {
          "ga": {
            "config": {
              "thermostatTemperatureRange": "10,30"
            }
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        "availableThermostatModes": ["off", "heat", "cool", "on", "heatcool", "auto", "eco"],
        "thermostatTemperatureUnit": "C",
        "thermostatTemperatureRange": {
          "maxThresholdCelsius": 30,
          "minThresholdCelsius": 10
        }
      });
    });

    test('getAttributes invalid temperaturerange', () => {
      const item = {
        "metadata": {
          "ga": {
            "config": {
              "thermostatTemperatureRange": "a,b"
            }
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        "availableThermostatModes": ["off", "heat", "cool", "on", "heatcool", "auto", "eco"],
        "thermostatTemperatureUnit": "C"
      });
    });

    test('getAttributes queryOnly', () => {
      const item = {
        "metadata": {
          "ga": {
            "config": {}
          }
        },
        "members": [
          {
            "metadata": {
              "ga": {
                "value": "thermostatTemperatureAmbient"
              }
            }
          }
        ]
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        "thermostatTemperatureUnit": "C",
        "queryOnlyTemperatureSetting": true
      });
    });
  });

  describe('getMembers', () => {
    expect(Device.getMembers({ "members": [{}] })).toStrictEqual({});
    expect(Device.getMembers({ "members": [{ "metadata": { "ga": { "value": "invalid" } } }] })).toStrictEqual({});
    test('getMembers', () => {
      const item = {
        "members": [
          {
            "name": "Mode",
            "state": "on",
            "metadata": {
              "ga": {
                "value": "thermostatMode"
              }
            }
          },
          {
            "name": "Setpoint",
            "state": "20",
            "metadata": {
              "ga": {
                "value": "thermostatTemperatureSetpoint"
              }
            }
          },
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
          },
          {
            "name": "Temperature",
            "state": "20",
            "metadata": {
              "ga": {
                "value": "thermostatTemperatureAmbient"
              }
            }
          },
          {
            "name": "Humidity",
            "state": "50",
            "metadata": {
              "ga": {
                "value": "thermostatHumidityAmbient"
              }
            }
          }
        ]
      };
      expect(Device.getMembers(item)).toStrictEqual({
        "thermostatMode": {
          "name": "Mode",
          "state": "on"
        },
        "thermostatTemperatureSetpoint": {
          "name": "Setpoint",
          "state": "20"
        },
        "thermostatTemperatureSetpointHigh": {
          "name": "High",
          "state": "25"
        },
        "thermostatTemperatureSetpointLow": {
          "name": "Low",
          "state": "5"
        },
        "thermostatTemperatureAmbient": {
          "name": "Temperature",
          "state": "20"
        },
        "thermostatHumidityAmbient": {
          "name": "Humidity",
          "state": "50"
        }
      });
    });

    test('getMembers with tags', () => {
      const item = {
        "members": [
          {
            "name": "Mode",
            "state": "on",
            "tags": ["HeatingCoolingMode"]
          },
          {
            "name": "Setpoint",
            "state": "20",
            "tags": ["TargetTemperature"]
          },
          {
            "name": "Temperature",
            "state": "20",
            "tags": ["CurrentTemperature"]
          },
          {
            "name": "Humidity",
            "state": "50",
            "tags": ["CurrentHumidity"]
          }
        ]
      };
      expect(Device.getMembers(item)).toStrictEqual({
        "thermostatMode": {
          "name": "Mode",
          "state": "on"
        },
        "thermostatTemperatureSetpoint": {
          "name": "Setpoint",
          "state": "20"
        },
        "thermostatTemperatureAmbient": {
          "name": "Temperature",
          "state": "20"
        },
        "thermostatHumidityAmbient": {
          "name": "Humidity",
          "state": "50"
        }
      });
    });
  });

  test('getModeMap', () => {
    const item = {
      "metadata": {
        "ga": {
          "config": {
            "modes": "on=ON:1,off=OFF:2,auto=3"
          }
        }
      }
    };
    expect(Device.getModeMap(item)).toStrictEqual({
      "on": [
        "ON",
        "1"
      ],
      "off": [
        "OFF",
        "2"
      ],
      "auto": [
        "3"
      ]
    });
    expect(Device.getModeMap({})).toStrictEqual({
      "off": ["off"],
      "heat": ["heat"],
      "cool": ["cool"],
      "on": ["on"],
      "heatcool": ["heatcool"],
      "auto": ["auto"],
      "eco": ["eco"]
    });
  });

  test('translateModeToOpenhab', () => {
    const item = {
      "metadata": {
        "ga": {
          "config": {
            "modes": "on=ON:1,off=OFF:2,auto=3"
          }
        }
      }
    };
    expect(Device.translateModeToOpenhab(item, "off")).toBe("OFF");
    expect(Device.translateModeToOpenhab(item, "auto")).toBe("3");
    expect(() => { Device.translateModeToOpenhab(item, "invalid") }).toThrow();
  });

  test('translateModeToGoogle', () => {
    const item = {
      "metadata": {
        "ga": {
          "config": {
            "modes": "on=ON:1,off=OFF:2,auto=3"
          }
        }
      }
    };
    expect(Device.translateModeToGoogle(item, "OFF")).toBe("off");
    expect(Device.translateModeToGoogle(item, "3")).toBe("auto");
    expect(Device.translateModeToGoogle(item, "invalid")).toBe("on");
  });

  describe('getState', () => {
    test('getState', () => {
      const item = {
        "members": [
          {
            "name": "Mode",
            "state": "on",
            "metadata": {
              "ga": {
                "value": "thermostatMode"
              }
            }
          },
          {
            "name": "Setpoint",
            "state": "20",
            "metadata": {
              "ga": {
                "value": "thermostatTemperatureSetpoint"
              }
            }
          },
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
          },
          {
            "name": "Temperature",
            "state": "20",
            "metadata": {
              "ga": {
                "value": "thermostatTemperatureAmbient"
              }
            }
          },
          {
            "name": "Humidity",
            "state": "50",
            "metadata": {
              "ga": {
                "value": "thermostatHumidityAmbient"
              }
            }
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        "thermostatHumidityAmbient": 50,
        "thermostatMode": "on",
        "thermostatTemperatureAmbient": 20,
        "thermostatTemperatureSetpoint": 20,
        "thermostatTemperatureSetpointHigh": 25,
        "thermostatTemperatureSetpointLow": 5
      });
    });

    test('getState only temperature', () => {
      const item = {
        "metadata": {
          "ga": {
            "config": {
              "useFahrenheit": true
            }
          }
        },
        "members": [
          {
            "name": "Temperature",
            "state": "20",
            "metadata": {
              "ga": {
                "value": "thermostatTemperatureAmbient"
              }
            }
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        "thermostatTemperatureAmbient": -6.7
      });
    });
  });
});

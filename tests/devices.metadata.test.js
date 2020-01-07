const Devices = require('../functions/devices.js');

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
          value: 'Lock'
        }
      }
    };
    const device = Devices.getDeviceForItem(item);
    expect(device.name).toBe('Lock');
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
          value: 'SecuritySystem'
        }
      }
    };
    const device = Devices.getDeviceForItem(item);
    expect(device.name).toBe('SecuritySystem');
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
            colorTemperatureRange: "1000,4000"
          }
        }
      }
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
  });
});

describe('Test Rollershutter Devices with Metadata', () => {
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
            inverted: true
          }
        }
      }
    };
    const device = Devices.getDeviceForItem(item);
    expect(device.name).toBe('Blinds');
    expect(device.getState(item)).toStrictEqual({
      openPercent: 0
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
    expect(Devices.Thermostat.usesFahrenheit({
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
    expect(Devices.Thermostat.getAttributes({
      metadata: {
        ga: {
          value: 'Thermostat',
          config: {
            useFahrenheit: true
          }
        }
      }
    })).toStrictEqual({
      'availableThermostatModes': 'off,heat,cool,on,heatcool',
      'thermostatTemperatureUnit': 'F',
    });

    expect(Devices.Thermostat.getAttributes({
      metadata: {
        ga: {
          value: 'Thermostat',
          config: {
            modes: 'on,off'
          }
        }
      }
    })).toStrictEqual({
      'availableThermostatModes': 'on,off',
      'thermostatTemperatureUnit': 'C',
    });
  });

  test('getState', () => {
    expect(Devices.Thermostat.getState({
      type: 'Group',
      metadata: {
        ga: {
          value: 'Thermostat'
        }
      }
    })).toStrictEqual({});

    expect(Devices.Thermostat.getState({
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

    expect(Devices.Thermostat.getState({
      type: 'Group',
      metadata: {
        ga: {
          value: 'Thermostat'
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
});

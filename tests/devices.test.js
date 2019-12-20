const Devices = require('../functions/devices.js');

describe('Test Lighting items', () => {
  test('Switch Lighting type', () => {
    expect(Devices.SimpleLight.appliesTo({
      type: 'Switch',
      tags: [
        'Lighting'
      ]
    })).toBe(true);
  });

  test('Switch Group Lighting type', () => {
    expect(Devices.SimpleLight.appliesTo({
      type: 'Group',
      groupType: 'Switch',
      tags: [
        'Lighting'
      ]
    })).toBe(true);
  });

  test('Dimmer Lighting type', () => {
    expect(Devices.DimmableLight.appliesTo({
      type: 'Dimmer',
      tags: [
        'Lighting'
      ]
    })).toBe(true);
  });

  test('Dimmer Group Lighting type', () => {
    expect(Devices.DimmableLight.appliesTo({
      type: 'Group',
      groupType: 'Dimmer',
      tags: [
        'Lighting'
      ]
    })).toBe(true);
  });

  test('Color Lighting type', () => {
    expect(Devices.ColorLight.appliesTo({
      type: 'Color',
      tags: [
        'Lighting'
      ]
    })).toBe(true);
  });

  test('Color Group Lighting type', () => {
    expect(Devices.ColorLight.appliesTo({
      type: 'Group',
      groupType: 'Color',
      tags: [
        'Lighting'
      ]
    })).toBe(true);
  });
});

describe('Test item for containing tag', () => {
  const item = {
    tags: [
      'testTag'
    ]
  };

  test('same case', () => {
    expect(Devices.Switch.hasTag(item, 'testTag')).toBe(true);
  });

  test('different case', () => {
    expect(Devices.Switch.hasTag(item, 'testtag')).toBe(true);
  });

  test('wrong writing', () => {
    expect(Devices.Switch.hasTag(item, 'test-tag')).toBe(false);
  });

  test('empty tags', () => {
    expect(Devices.Switch.hasTag({ tags: [] }, 'testTag')).toBe(false);
  });
});

describe('Test Thermostat item', () => {
  test('appliesTo', () => {
    expect(Devices.Thermostat.appliesTo({
      type: 'Group',
      tags: [
        'Thermostat'
      ]
    })).toBe(true);

    expect(Devices.Thermostat.appliesTo({
      type: 'Switch',
      tags: [
        'Thermostat'
      ]
    })).toBe(false);

    expect(Devices.Thermostat.appliesTo({
      type: 'Group',
      tags: [
        'Something'
      ]
    })).toBe(false);
  });

  test('usesFahrenheit', () => {
    expect(Devices.Thermostat.usesFahrenheit({
      tags: [
        'Thermostat',
        'Fahrenheit'
      ]
    })).toBe(true);
  });

  test('getAttributes', () => {
    expect(Devices.Thermostat.getAttributes({
      tags: [
        'Thermostat',
        'Fahrenheit'
      ]
    })).toStrictEqual({
      'availableThermostatModes': 'off,heat,cool,on,heatcool',
      'thermostatTemperatureUnit': 'F',
    });

    expect(Devices.Thermostat.getAttributes({
      tags: [
        'Thermostat'
      ]
    })).toStrictEqual({
      'availableThermostatModes': 'off,heat,cool,on,heatcool',
      'thermostatTemperatureUnit': 'C',
    });
  });

  test('convertToCelsius', () => {
    expect(Devices.Thermostat.convertToCelsius(10.0)).toEqual(-12.2);
    expect(Devices.Thermostat.convertToCelsius(0.0)).toEqual(-17.8);
  });

  test('convertToFahrenheit', () => {
    expect(Devices.Thermostat.convertToFahrenheit(10.0)).toEqual(50);
    expect(Devices.Thermostat.convertToFahrenheit(0.0)).toEqual(32);
  });

  test('normalizeThermostatMode', () => {
    expect(Devices.Thermostat.normalizeThermostatMode('heat')).toEqual('heat');
    expect(Devices.Thermostat.normalizeThermostatMode('off')).toEqual('off');
    expect(Devices.Thermostat.normalizeThermostatMode('on')).toEqual('on');
    expect(Devices.Thermostat.normalizeThermostatMode('heat-cool')).toEqual('heatcool');
    expect(Devices.Thermostat.normalizeThermostatMode('0')).toEqual('off');
    expect(Devices.Thermostat.normalizeThermostatMode('1')).toEqual('heat');
    expect(Devices.Thermostat.normalizeThermostatMode('2')).toEqual('cool');
    expect(Devices.Thermostat.normalizeThermostatMode('3')).toEqual('on');
  });

  test('denormalizeThermostatMode', () => {
    expect(Devices.Thermostat.denormalizeThermostatMode('heat', 'heat')).toEqual('heat');
    expect(Devices.Thermostat.denormalizeThermostatMode('heat', 'off')).toEqual('off');
    expect(Devices.Thermostat.denormalizeThermostatMode('heat', 'on')).toEqual('on');
    expect(Devices.Thermostat.denormalizeThermostatMode('heat', 'heat-cool')).toEqual('on');
    expect(Devices.Thermostat.denormalizeThermostatMode('0', 'off')).toEqual('0');
    expect(Devices.Thermostat.denormalizeThermostatMode('1', 'heat')).toEqual('1');
    expect(Devices.Thermostat.denormalizeThermostatMode('2', 'cool')).toEqual('2');
    expect(Devices.Thermostat.denormalizeThermostatMode('3', 'on')).toEqual('3');
  });

  test('getState', () => {
    expect(Devices.Thermostat.getState({
      type: 'Group',
      tags: [
        'Thermostat'
      ]
    })).toStrictEqual({});

    expect(Devices.Thermostat.getState({
      type: 'Group',
      tags: [
        'Thermostat',
        'Fahrenheit'
      ],
      members: [{
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
        type: 'Number',
        tags: [
          'HeatingCoolingMode'
        ],
        state: 'off'
      }]
    })).toStrictEqual({
      'thermostatTemperatureAmbient': -12.2,
      'thermostatTemperatureSetpoint': -12.2,
      'thermostatMode': 'off'
    });

    expect(Devices.Thermostat.getState({
      type: 'Group',
      tags: [
        'Thermostat'
      ],
      members: [{
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
      }]
    })).toStrictEqual({
      'thermostatTemperatureAmbient': 10,
      'thermostatTemperatureSetpoint': 10,
      'thermostatMode': 'heat',
      'thermostatHumidityAmbient': 50,
    });
  });
});

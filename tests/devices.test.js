const Devices = require('../functions/devices.js');

describe('Test Thermostat Device', () => {
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
    expect(Devices.Thermostat.denormalizeThermostatMode('heat', 'heatcool')).toEqual('heatcool');
    expect(Devices.Thermostat.denormalizeThermostatMode('0', 'off')).toEqual('0');
    expect(Devices.Thermostat.denormalizeThermostatMode('1', 'heat')).toEqual('1');
    expect(Devices.Thermostat.denormalizeThermostatMode('2', 'cool')).toEqual('2');
    expect(Devices.Thermostat.denormalizeThermostatMode('3', 'on')).toEqual('3');
  });
});

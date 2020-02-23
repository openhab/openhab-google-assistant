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
});

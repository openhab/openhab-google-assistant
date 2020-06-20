const Thermostat = require('../functions/devices/thermostat.js');

describe('Test Thermostat Device', () => {
  test('convertToCelsius', () => {
    expect(Thermostat.convertToCelsius(10.0)).toEqual(-12.2);
    expect(Thermostat.convertToCelsius(0.0)).toEqual(-17.8);
  });

  test('convertToFahrenheit', () => {
    expect(Thermostat.convertToFahrenheit(10.0)).toEqual(50);
    expect(Thermostat.convertToFahrenheit(0.0)).toEqual(32);
  });
});

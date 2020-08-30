const Utilities = require('../functions/utilities.js');

describe('Test Utilities', () => {
  test('convertToCelsius', () => {
    expect(Utilities.convertToCelsius(10.0)).toEqual(-12.2);
    expect(Utilities.convertToCelsius(0.0)).toEqual(-17.8);
  });

  test('convertToFahrenheit', () => {
    expect(Utilities.convertToFahrenheit(10.0)).toEqual(50);
    expect(Utilities.convertToFahrenheit(0.0)).toEqual(32);
  });
});

const Utilities = require('../functions/utilities.js');

describe('Utilities', () => {
  test('convertFahrenheitToCelsius', () => {
    expect(Utilities.convertFahrenheitToCelsius(10.0)).toEqual(-12.2);
    expect(Utilities.convertFahrenheitToCelsius(0.0)).toEqual(-17.8);
  });

  test('convertCelsiusToFahrenheit', () => {
    expect(Utilities.convertCelsiusToFahrenheit(10.0)).toEqual(50);
    expect(Utilities.convertCelsiusToFahrenheit(0.0)).toEqual(32);
  });

  test('convertKelvinToRgb', () => {
    expect(Utilities.convertKelvinToRgb(2000)).toStrictEqual({ b: 14, g: 137, r: 255 });
    expect(Utilities.convertKelvinToRgb(5900)).toEqual({ b: 234, g: 244, r: 255 });
    expect(Utilities.convertKelvinToRgb(9000)).toEqual({ b: 255, g: 223, r: 210 });
  });

  test('convertKelvinToMired', () => {
    expect(Utilities.convertMired(3400)).toBe(294);
    expect(Utilities.convertMired(294)).toBe(3401);
  });

  test('convertRgbToHsv', () => {
    expect(Utilities.convertRgbToHsv({ r: 50, g: 10, b: 100 })).toStrictEqual({
      hue: 266.67,
      saturation: 0.9,
      value: 0.39
    });
    expect(Utilities.convertRgbToHsv({ r: 0, g: 0, b: 0 })).toStrictEqual({ hue: 0, saturation: 0, value: 0 });
    expect(Utilities.convertRgbToHsv({ r: 255, g: 0, b: 0 })).toStrictEqual({ hue: 0, saturation: 1, value: 1 });
    expect(Utilities.convertRgbToHsv({ r: 0, g: 255, b: 0 })).toStrictEqual({ hue: 120, saturation: 1, value: 1 });
    expect(Utilities.convertRgbToHsv({ r: 0, g: 0, b: 255 })).toStrictEqual({ hue: 240, saturation: 1, value: 1 });
  });
});

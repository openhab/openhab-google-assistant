const Config = require('../functions/config.js');

describe('Config', () => {
  test('Config all properties', () => {
    expect(Object.keys(Config)).toStrictEqual(["host", "port", "path"]);
  });
});

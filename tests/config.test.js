const Config = require('../functions/config.js');

describe('Config', () => {
  test('All properties available', () => {
    expect(Object.keys(Config)).toStrictEqual(['host', 'port', 'path']);
  });

  test('Properties used from ENV', () => {
    expect(Config.host).toBe('test.host');
    expect(Config.port).toBe('1234');
    expect(Config.path).toBe('/test/items');
  });
});

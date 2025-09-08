const nock = require('nock');
const ApiHandler = require('../functions/apihandler.js');

describe('ApiHandler', () => {
  const config = {
    host: 'example.org',
    path: 'items',
    port: 443
  };

  const apiHandler = new ApiHandler(config);

  beforeEach(() => {
    apiHandler.authToken = 'token';
  });

  test('constructor', () => {
    const apiHandler2 = new ApiHandler({ path: '/items/' });
    expect(apiHandler2._config).toStrictEqual({ path: '/items/' });

    expect(apiHandler._config).toStrictEqual({
      host: 'example.org',
      path: '/items/',
      port: 443
    });
    expect(apiHandler._authToken).toBe('token');
  });

  test('authToken', () => {
    apiHandler.authToken = '1234';
    expect(apiHandler._authToken).toBe('1234');
  });

  describe('getOptions', () => {
    test('getOptions GET all items', () => {
      expect(apiHandler.getOptions('GET', '', 0)).toStrictEqual({
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer token'
        },
        hostname: 'example.org',
        method: 'GET',
        path: '/items/?metadata=ga,synonyms&fields=groupNames,groupType,name,label,metadata,type,state',
        port: 443
      });
    });

    test('getOptions GET single items', () => {
      expect(apiHandler.getOptions('GET', 'TestItem', 0)).toStrictEqual({
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer token'
        },
        hostname: 'example.org',
        method: 'GET',
        path: '/items/TestItem?metadata=ga,synonyms',
        port: 443
      });
    });

    test('getOptions POST', () => {
      expect(apiHandler.getOptions('POST', 'TestItem', 10)).toStrictEqual({
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer token',
          'Content-Length': 10,
          'Content-Type': 'text/plain'
        },
        hostname: 'example.org',
        method: 'POST',
        path: '/items/TestItem',
        port: 443
      });
    });

    test('getOptions GET userpass', () => {
      apiHandler._config.userpass = 'tester:test';
      expect(apiHandler.getOptions('GET', 'TestItem', 0)).toStrictEqual({
        auth: 'tester:test',
        headers: {
          Accept: 'application/json'
        },
        hostname: 'example.org',
        method: 'GET',
        path: '/items/TestItem?metadata=ga,synonyms',
        port: 443
      });
    });
  });

  describe('getItem', () => {
    afterEach(() => {
      nock.cleanAll();
    });

    test('getItem', async () => {
      const scope = nock('https://example.org')
        .get('/items/TestItem?metadata=ga,synonyms')
        .reply(200, { name: 'TestItem' });
      const result = await apiHandler.getItem('TestItem');
      expect(result).toStrictEqual({ name: 'TestItem' });
      expect(scope.isDone()).toBe(true);
    });

    test('getItem failed bad JSON', async () => {
      const scope = nock('https://example.org').get('/items/TestItem?metadata=ga,synonyms').reply(200, 'INVALID');
      await expect(apiHandler.getItem('TestItem')).rejects.toStrictEqual({
        message:
          // eslint-disable-next-line max-len
          'getItem - JSON parse failed for path: /items/TestItem?metadata=ga,synonyms - SyntaxError: Unexpected token \'I\', "INVALID" is not valid JSON',
        statusCode: 415
      });
      expect(scope.isDone()).toBe(true);
    });
  });

  describe('getItems', () => {
    afterEach(() => {
      nock.cleanAll();
    });

    test('getItems', async () => {
      const scope = nock('https://example.org')
        .get('/items/?metadata=ga,synonyms&fields=groupNames,groupType,name,label,metadata,type,state')
        .reply(200, [{ name: 'TestItem' }]);
      const result = await apiHandler.getItems();
      expect(result).toStrictEqual([{ name: 'TestItem' }]);
      expect(scope.isDone()).toBe(true);
    });

    test('getItems failed', async () => {
      const scope = nock('https://example.org')
        .get('/items/?metadata=ga,synonyms&fields=groupNames,groupType,name,label,metadata,type,state')
        .reply(400, {});
      await expect(apiHandler.getItems()).rejects.toStrictEqual({
        message:
          // eslint-disable-next-line max-len
          'getItem - failed for path: /items/?metadata=ga,synonyms&fields=groupNames,groupType,name,label,metadata,type,state',
        statusCode: 400
      });
      expect(scope.isDone()).toBe(true);
    });

    test('getItems error', async () => {
      const scope = nock('https://example.org')
        .get('/items/?metadata=ga,synonyms&fields=groupNames,groupType,name,label,metadata,type,state')
        .replyWithError('could not reach server');
      await expect(apiHandler.getItems()).rejects.toThrow('could not reach server');
      expect(scope.isDone()).toBe(true);
    });
  });

  describe('sendCommand', () => {
    afterEach(() => {
      nock.cleanAll();
    });

    test('sendCommand', async () => {
      const scope = nock('https://example.org')
        .post('/items/TestItem')
        .reply(200, [{ name: 'TestItem' }]);
      const result = await apiHandler.sendCommand('TestItem', 'OFF');
      expect(result).toBe(true);
      expect(scope.isDone()).toBe(true);
    });

    test('sendCommand failed', async () => {
      const scope = nock('https://example.org').post('/items/TestItem').reply(400, {});
      await expect(apiHandler.sendCommand('TestItem', 'OFF')).rejects.toStrictEqual({
        message: 'sendCommand - failed for path: /items/TestItem',
        statusCode: 400
      });
      expect(scope.isDone()).toBe(true);
    });

    test('sendCommand error', async () => {
      const scope = nock('https://example.org').post('/items/TestItem').replyWithError('could not reach server');
      await expect(apiHandler.sendCommand('TestItem', 'OFF')).rejects.toThrow('could not reach server');
      expect(scope.isDone()).toBe(true);
    });
  });
});

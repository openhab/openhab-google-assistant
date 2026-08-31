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

  test('constructor root path stays a single slash', () => {
    const apiHandler2 = new ApiHandler({ path: '/' });
    expect(apiHandler2._config.path).toBe('/');
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
      expect(apiHandler.getOptions('POST', 'TestItem')).toStrictEqual({
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer token',
          'Content-Type': 'text/plain',
          'X-OpenHAB-Source': 'org.openhab.googleassistant'
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
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from('tester:test').toString('base64')}`
        },
        hostname: 'example.org',
        method: 'GET',
        path: '/items/TestItem?metadata=ga,synonyms',
        port: 443
      });
    });
  });

  describe('getUrl', () => {
    test('bare hostname', () => {
      expect(apiHandler.getUrl({ hostname: 'example.org', port: 443, path: '/items/' })).toBe(
        'https://example.org:443/items/'
      );
    });

    test('brackets a raw IPv6 hostname', () => {
      expect(apiHandler.getUrl({ hostname: '::1', port: 8080, path: '/items/' })).toBe('http://[::1]:8080/items/');
    });

    test('does not double-bracket an already-bracketed IPv6 hostname', () => {
      expect(apiHandler.getUrl({ hostname: '[::1]', port: 8080, path: '/items/' })).toBe('http://[::1]:8080/items/');
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

    test('getItem does not follow redirects', async () => {
      const scope = nock('https://example.org')
        .get('/items/TestItem?metadata=ga,synonyms')
        .reply(302, undefined, { Location: 'https://example.org/items/Other' });
      await expect(apiHandler.getItem('TestItem')).rejects.toStrictEqual({
        statusCode: 302,
        message: 'getItem - failed for path: /items/TestItem?metadata=ga,synonyms'
      });
      expect(scope.isDone()).toBe(true);
    });

    test('getItem propagates a body-read failure unchanged', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        status: 200,
        json: () => Promise.reject(new Error('stream terminated'))
      });
      await expect(apiHandler.getItem('TestItem')).rejects.toThrow('stream terminated');
      fetchSpy.mockRestore();
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

    test('getItems rejects on 201', async () => {
      const scope = nock('https://example.org')
        .get('/items/?metadata=ga,synonyms&fields=groupNames,groupType,name,label,metadata,type,state')
        .reply(201, [{ name: 'TestItem' }]);
      await expect(apiHandler.getItems()).rejects.toStrictEqual({
        message:
          // eslint-disable-next-line max-len
          'getItem - failed for path: /items/?metadata=ga,synonyms&fields=groupNames,groupType,name,label,metadata,type,state',
        statusCode: 201
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

    test('sendCommand does not follow redirects', async () => {
      const scope = nock('https://example.org')
        .post('/items/TestItem')
        .reply(302, undefined, { Location: 'https://example.org/items/Other' });
      await expect(apiHandler.sendCommand('TestItem', 'OFF')).rejects.toStrictEqual({
        statusCode: 302,
        message: 'sendCommand - failed for path: /items/TestItem'
      });
      expect(scope.isDone()).toBe(true);
    });
  });
});

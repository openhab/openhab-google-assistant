const ApiHandler = require('../functions/apihandler.js');
const nock = require('nock');

describe('ApiHandler', () => {
  const config = {
    "host": "example.org",
    "path": "items",
    "port": 443
  }

  const apiHander = new ApiHandler(config);

  beforeEach(() => {
    apiHander.authToken = "token";
  });

  test('constructor', () => {
    expect(apiHander._config).toStrictEqual({
      "host": "example.org",
      "path": "/items/",
      "port": 443
    });
    expect(apiHander._authToken).toBe("token");
  });

  test('authToken', () => {
    apiHander.authToken = "1234";
    expect(apiHander._authToken).toBe("1234");
  });

  describe('getOptions', () => {
    test('getOptions GET all items', () => {
      expect(apiHander.getOptions("GET", "", 0)).toStrictEqual({
        "headers": {
          "Accept": "application/json",
          "Authorization": "Bearer token"
        },
        "hostname": "example.org",
        "method": "GET",
        "path": "/items/?metadata=ga,synonyms&fields=groupNames,groupType,name,label,metadata,tags,type,state",
        "port": 443
      });
    });

    test('getOptions GET single items', () => {
      expect(apiHander.getOptions("GET", "TestItem", 0)).toStrictEqual({
        "headers": {
          "Accept": "application/json",
          "Authorization": "Bearer token"
        },
        "hostname": "example.org",
        "method": "GET",
        "path": "/items/TestItem?metadata=ga,synonyms",
        "port": 443
      });
    });

    test('getOptions POST', () => {
      expect(apiHander.getOptions("POST", "TestItem", 10)).toStrictEqual({
        "headers": {
          "Accept": "application/json",
          "Authorization": "Bearer token",
          "Content-Length": 10,
          "Content-Type": "text/plain"
        },
        "hostname": "example.org",
        "method": "POST",
        "path": "/items/TestItem?metadata=ga,synonyms",
        "port": 443
      });
    });

    test('getOptions GET userpass', () => {
      apiHander._config.userpass = "tester:test";
      expect(apiHander.getOptions("GET", "TestItem", 0)).toStrictEqual({
        "auth": "tester:test",
        "headers": {
          "Accept": "application/json"
        },
        "hostname": "example.org",
        "method": "GET",
        "path": "/items/TestItem?metadata=ga,synonyms",
        "port": 443
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
        .reply(200, [{ "name": "TestItem" }]);
      const result = await apiHander.getItem("TestItem");
      expect(result).toStrictEqual([{ "name": "TestItem" }]);
      expect(scope.isDone()).toBe(true);
    });

    test('getItem failed', async () => {
      const scope = nock('https://example.org')
        .get('/items/TestItem?metadata=ga,synonyms')
        .reply(400, {});
      let error = {};
      try {
        await apiHander.getItem("TestItem");
      } catch (e) {
        error = e;
      }
      expect(error).toStrictEqual({
        "message": "getItem failed",
        "statusCode": 400
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
        .get('/items/?metadata=ga,synonyms&fields=groupNames,groupType,name,label,metadata,tags,type,state')
        .reply(200, [{ "name": "TestItem" }]);
      const result = await apiHander.getItems();
      expect(result).toStrictEqual([{ "name": "TestItem" }]);
      expect(scope.isDone()).toBe(true);
    });

    test('getItems failed', async () => {
      const scope = nock('https://example.org')
        .get('/items/?metadata=ga,synonyms&fields=groupNames,groupType,name,label,metadata,tags,type,state')
        .reply(400, {});
      let error = {};
      try {
        await apiHander.getItems();
      } catch (e) {
        error = e;
      }
      expect(error).toStrictEqual({
        "message": "getItem failed",
        "statusCode": 400
      });
      expect(scope.isDone()).toBe(true);
    });
  });

  describe('sendCommand', () => {
    afterEach(() => {
      nock.cleanAll();
    });

    test('sendCommand', async () => {
      const scope = nock('https://example.org')
        .post('/items/TestItem?metadata=ga,synonyms')
        .reply(200, [{ "name": "TestItem" }]);
      const result = await apiHander.sendCommand("TestItem", "OFF");
      expect(result).toBeUndefined();
      expect(scope.isDone()).toBe(true);
    });

    test('sendCommand failed', async () => {
      const scope = nock('https://example.org')
        .post('/items/TestItem?metadata=ga,synonyms')
        .reply(400, {});
      let error = {};
      try {
        await apiHander.sendCommand("TestItem", "OFF");
      } catch (e) {
        error = e;
      }
      expect(error).toStrictEqual({
        "message": "sendCommand failed",
        "statusCode": 400
      });
      expect(scope.isDone()).toBe(true);
    });
  });
});

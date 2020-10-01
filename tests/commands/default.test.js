const Command = require('../../functions/commands/default.js');

describe('Default Command', () => {
  test('validateParams', () => {
    expect(Command.validateParams({})).toBe(true);
  });

  test('convertParamsToValue', () => {
    expect(Command.convertParamsToValue({}, {}, {})).toBe(null);
  });

  test('getResponseStates', () => {
    expect(Command.getResponseStates({}, {}, {})).toStrictEqual({});
  });

  test('getItemName', () => {
    expect(Command.getItemName({ "name": "Item" }, {})).toBe("Item");
  });

  test('requiresItem', () => {
    expect(Command.requiresItem({})).toBe(false);
  });

  test('handleAuthPin', () => {
    expect(Command.handleAuthPin({ "id": "Item", "customData": {} }, {})).toBeUndefined();
    expect(Command.handleAuthPin({ "id": "Item", "customData": { "pinNeeded": "1234" } }, { "pin": "1234" })).toBeUndefined();
    expect(Command.handleAuthPin({ "id": "Item", "customData": { "pinNeeded": "1234" } }, {})).toStrictEqual({
      ids: ["Item"],
      status: 'ERROR',
      errorCode: 'challengeNeeded',
      challengeNeeded: {
        type: 'pinNeeded'
      }
    });
    expect(Command.handleAuthPin({ "id": "Item", "customData": { "pinNeeded": "1234" } }, { "pin": "5678" })).toStrictEqual({
      ids: ["Item"],
      status: 'ERROR',
      errorCode: 'challengeNeeded',
      challengeNeeded: {
        type: 'challengeFailedPinNeeded'
      }
    });
  });

  test('handleAuthAck', () => {
    expect(Command.handleAuthAck({ "id": "Item", "customData": {} }, {}, {})).toBeUndefined();
    expect(Command.handleAuthAck({ "id": "Item", "customData": { "ackNeeded": true } }, { "ack": true }, {})).toBeUndefined();
    expect(Command.handleAuthAck({ "id": "Item", "customData": { "ackNeeded": true } }, {}, { "key": "value" })).toStrictEqual({
      ids: ["Item"],
      status: 'ERROR',
      states: { "key": "value" },
      errorCode: 'challengeNeeded',
      challengeNeeded: {
        type: 'ackNeeded'
      }
    });
  });
});

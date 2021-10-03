const Command = require('../../functions/commands/default.js');

class TestCommand1 extends Command {
  static get type() {
    return 'action.devices.commands.OnOff';
  }
  static convertParamsToValue() {
    return 'TEST';
  }
  static getResponseStates(params) {
    return params;
  }
}

class TestCommand2 extends TestCommand1 {
  static requiresItem() {
    return true;
  }
}

class TestCommand3 extends TestCommand1 {
  static convertParamsToValue() {
    return;
  }
}

class TestCommand4 extends TestCommand1 {
  static convertParamsToValue() {
    throw { statusCode: 400 };
  }
}

class TestCommand5 extends TestCommand1 {
  static get requiresUpdateValidation() {
    return true;
  }
  static bypassPin() {
    return true;
  }
}

class TestCommand6 extends TestCommand1 {
  static get requiresUpdateValidation() {
    return true;
  }
  static validateUpdate() {
    return { someError: true };
  }
}

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
    expect(Command.getItemName({ name: 'Item' }, {})).toBe('Item');
  });

  test('requiresItem', () => {
    expect(Command.requiresItem({})).toBe(false);
  });

  test('handleAuthPin', () => {
    expect(Command.handleAuthPin({ id: 'Item', customData: {} }, undefined)).toBeUndefined();
    expect(Command.handleAuthPin({ id: 'Item', customData: { pinNeeded: '1234' } }, { pin: '1234' })).toBeUndefined();
    expect(Command.handleAuthPin({ id: 'Item', customData: { pinNeeded: '1234' } }, undefined)).toStrictEqual({
      ids: ['Item'],
      status: 'ERROR',
      errorCode: 'challengeNeeded',
      challengeNeeded: {
        type: 'pinNeeded'
      }
    });
    expect(Command.handleAuthPin({ id: 'Item', customData: { pinNeeded: '1234' } }, { pin: '5678' })).toStrictEqual({
      ids: ['Item'],
      status: 'ERROR',
      errorCode: 'challengeNeeded',
      challengeNeeded: {
        type: 'challengeFailedPinNeeded'
      }
    });
    // legacy tfa
    expect(Command.handleAuthPin({ id: 'Item', customData: { tfaPin: '1234' } }, { pin: '1234' })).toBeUndefined();
    expect(Command.handleAuthPin({ id: 'Item', customData: { tfaPin: '1234' } }, undefined)).toStrictEqual({
      ids: ['Item'],
      status: 'ERROR',
      errorCode: 'challengeNeeded',
      challengeNeeded: {
        type: 'pinNeeded'
      }
    });
    // bypasspin
    expect(TestCommand5.handleAuthPin({ id: 'Item', customData: { pinNeeded: '1234' } }, undefined)).toBeUndefined();
  });

  test('handleAuthAck', () => {
    expect(Command.handleAuthAck({ id: 'Item', customData: {} }, {}, undefined)).toBeUndefined();
    expect(
      Command.handleAuthAck({ id: 'Item', customData: { ackNeeded: true } }, { ack: true }, undefined)
    ).toBeUndefined();
    expect(Command.handleAuthAck({ id: 'Item', customData: { ackNeeded: true } }, {}, { key: 'value' })).toStrictEqual({
      ids: ['Item'],
      status: 'ERROR',
      states: { key: 'value' },
      errorCode: 'challengeNeeded',
      challengeNeeded: {
        type: 'ackNeeded'
      }
    });
    // legacy tfa
    expect(
      Command.handleAuthAck({ id: 'Item', customData: { tfaAck: true } }, { ack: true }, undefined)
    ).toBeUndefined();
    expect(Command.handleAuthAck({ id: 'Item', customData: { tfaAck: true } }, {}, { key: 'value' })).toStrictEqual({
      ids: ['Item'],
      status: 'ERROR',
      states: { key: 'value' },
      errorCode: 'challengeNeeded',
      challengeNeeded: {
        type: 'ackNeeded'
      }
    });
  });

  describe('execute', () => {
    const getItemMock = jest.fn();
    const sendCommandMock = jest.fn();

    const apiHandler = {
      getItem: getItemMock,
      sendCommand: sendCommandMock
    };

    const successResponse = {
      ids: ['Item1'],
      states: {
        on: true,
        online: true
      },
      status: 'SUCCESS'
    };

    beforeEach(() => {
      getItemMock.mockClear();
      sendCommandMock.mockClear();
      sendCommandMock.mockReturnValue(Promise.resolve());
      getItemMock.mockReturnValue(Promise.resolve({ name: 'TestItem' }));
    });

    test('execute without responseStates', async () => {
      const devices = [{ id: 'Item1' }];
      const result = await TestCommand1.execute(apiHandler, devices, {});
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual([
        {
          ids: ['Item1'],
          states: {},
          status: 'SUCCESS'
        }
      ]);
    });

    test('execute without sent command', async () => {
      const devices = [{ id: 'Item1' }];
      const result = await TestCommand3.execute(apiHandler, devices, { on: true });
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(0);
      expect(result).toStrictEqual([successResponse]);
    });

    test('execute without getItem', async () => {
      const devices = [{ id: 'Item1' }];
      const result = await TestCommand1.execute(apiHandler, devices, { on: true });
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual([successResponse]);
    });

    test('execute with getItem', async () => {
      const devices = [{ id: 'Item1' }];
      const result = await TestCommand2.execute(apiHandler, devices, { on: true });
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual([successResponse]);
    });

    test('execute with multiple getItem', async () => {
      const successResponse2 = Object.assign({}, successResponse);
      successResponse2.ids = ['Item2'];
      const devices = [{ id: 'Item1' }, { id: 'Item2' }];
      const result = await TestCommand2.execute(apiHandler, devices, { on: true });
      expect(getItemMock).toHaveBeenCalledTimes(2);
      expect(sendCommandMock).toHaveBeenCalledTimes(2);
      expect(result).toStrictEqual([successResponse, successResponse2]);
    });

    test('execute with pinNeeded', async () => {
      const devices = [{ id: 'Item1', customData: { pinNeeded: '1234' } }];
      const result = await TestCommand1.execute(apiHandler, devices, { on: true });
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(0);
      expect(result).toStrictEqual([
        {
          ids: ['Item1'],
          challengeNeeded: {
            type: 'pinNeeded'
          },
          errorCode: 'challengeNeeded',
          status: 'ERROR'
        }
      ]);
    });

    test('execute with corrrect pin', async () => {
      const devices = [{ id: 'Item1', customData: { pinNeeded: '1234' } }];
      const result = await TestCommand1.execute(apiHandler, devices, { on: true }, { pin: '1234' });
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual([successResponse]);
    });

    test('execute with ackNeeded', async () => {
      const devices = [{ id: 'Item1', customData: { ackNeeded: true } }];
      const result = await TestCommand1.execute(apiHandler, devices, { on: true });
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(sendCommandMock).toHaveBeenCalledTimes(0);
      expect(result).toStrictEqual([
        {
          ids: ['Item1'],
          challengeNeeded: {
            type: 'ackNeeded'
          },
          errorCode: 'challengeNeeded',
          states: {
            on: true,
            online: true
          },
          status: 'ERROR'
        }
      ]);
    });

    test('execute with ackNeeded and state', async () => {
      const devices = [{ id: 'Item1', customData: { ackNeeded: true } }];
      const result = await TestCommand2.execute(apiHandler, devices, { on: true });
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(sendCommandMock).toHaveBeenCalledTimes(0);
      expect(result).toStrictEqual([
        {
          ids: ['Item1'],
          challengeNeeded: {
            type: 'ackNeeded'
          },
          errorCode: 'challengeNeeded',
          states: {
            on: true,
            online: true
          },
          status: 'ERROR'
        }
      ]);
    });

    test('execute with ackNeeded and ack', async () => {
      const devices = [{ id: 'Item1', customData: { ackNeeded: true } }];
      const result = await TestCommand3.execute(apiHandler, devices, { on: true }, { ack: true });
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(0);
      expect(result).toStrictEqual([
        {
          ids: ['Item1'],
          states: {
            on: true,
            online: true
          },
          status: 'SUCCESS'
        }
      ]);
    });

    test('execute with ack', async () => {
      const devices = [{ id: 'Item1', customData: { ackNeeded: true } }];
      const result = await TestCommand1.execute(apiHandler, devices, { on: true }, { ack: true });
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual([successResponse]);
    });

    test('execute with device not found', async () => {
      getItemMock.mockReturnValue(Promise.reject({ statusCode: '404' }));
      const devices = [{ id: 'Item1' }];
      const result = await TestCommand2.execute(apiHandler, devices, { on: true });
      expect(getItemMock).toHaveBeenCalledTimes(1);
      expect(sendCommandMock).toHaveBeenCalledTimes(0);
      expect(result).toStrictEqual([
        {
          errorCode: 'deviceNotFound',
          ids: ['Item1'],
          status: 'ERROR'
        }
      ]);
    });

    test('execute with not supported', async () => {
      const devices = [{ id: 'Item1' }];
      const result = await TestCommand4.execute(apiHandler, devices, { on: true });
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(0);
      expect(result).toStrictEqual([
        {
          errorCode: 'notSupported',
          ids: ['Item1'],
          status: 'ERROR'
        }
      ]);
    });

    test('execute with device offline', async () => {
      sendCommandMock.mockReturnValue(Promise.reject({ statusCode: 500 }));
      const devices = [{ id: 'Item1' }];
      const result = await TestCommand1.execute(apiHandler, devices, { on: true });
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual([
        {
          errorCode: 'deviceOffline',
          ids: ['Item1'],
          status: 'ERROR'
        }
      ]);
    });

    test('execute with errorCode', async () => {
      sendCommandMock.mockReturnValue(Promise.reject({ errorCode: 'noAvailableChannel' }));
      const devices = [{ id: 'Item1' }];
      const result = await TestCommand1.execute(apiHandler, devices, { on: true });
      expect(getItemMock).toHaveBeenCalledTimes(0);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual([
        {
          errorCode: 'noAvailableChannel',
          ids: ['Item1'],
          status: 'ERROR'
        }
      ]);
    });

    test('execute with updateValidation', async () => {
      getItemMock.mockReturnValue(
        Promise.resolve({ name: 'TestItem', type: 'Switch', state: 'ON', metadata: { ga: { value: 'Switch' } } })
      );
      const devices = [{ id: 'Item1' }];
      const result = await TestCommand5.execute(apiHandler, devices, { on: true });
      expect(getItemMock).toHaveBeenCalledTimes(2);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual([successResponse]);
    });

    test('execute with updateValidation and device not found', async () => {
      const devices = [{ id: 'Item1' }];
      const result = await TestCommand5.execute(apiHandler, devices, { on: true });
      expect(getItemMock).toHaveBeenCalledTimes(2);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual([
        {
          errorCode: 'deviceNotFound',
          ids: ['Item1'],
          status: 'ERROR'
        }
      ]);
    });

    test('execute with failed updateValidation', async () => {
      getItemMock.mockReturnValue(
        Promise.resolve({ name: 'TestItem', type: 'Switch', state: 'ON', metadata: { ga: { value: 'Switch' } } })
      );
      const devices = [{ id: 'Item1' }];
      const result = await TestCommand6.execute(apiHandler, devices, { on: true });
      expect(getItemMock).toHaveBeenCalledTimes(2);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual([{ someError: true }]);
    });

    test('execute with updateValidation and wait time', async () => {
      const timeoutSpy = jest.spyOn(global, 'setTimeout');
      timeoutSpy.mockImplementation((fn) => fn());
      getItemMock.mockReturnValue(
        Promise.resolve({ name: 'TestItem', type: 'Switch', state: 'ON', metadata: { ga: { value: 'Switch' } } })
      );
      const devices = [{ id: 'Item1', customData: { waitForStateChange: 5 } }];
      const result = await TestCommand5.execute(apiHandler, devices, { on: true });
      expect(getItemMock).toHaveBeenCalledTimes(2);
      expect(sendCommandMock).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
      expect(result).toStrictEqual([successResponse]);
    });
  });
});

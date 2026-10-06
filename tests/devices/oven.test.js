const Oven = require('../../functions/devices/oven.js');

describe('Oven Device', () => {
  test('matchesDeviceType without members', () => {
    expect(
      Oven.matchesDeviceType({
        metadata: { ga: { value: 'OVEN' } }
      })
    ).toBe(false);
  });

  test('matchesDeviceType with members', () => {
    expect(
      Oven.matchesDeviceType({
        metadata: { ga: { value: 'OVEN' } },
        members: [{ name: 'OvenPower', state: 'ON', type: 'Switch', metadata: { ga: { value: 'ovenPower' } } }]
      })
    ).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Oven.matchesItemType({ type: 'Group' })).toBe(true);
    expect(Oven.matchesItemType({ type: 'Switch' })).toBe(false);
  });

  describe('getTraits', () => {
    test('Power only', () => {
      const item = {
        type: 'Group',
        members: [{ name: 'OvenPower', type: 'Switch', metadata: { ga: { value: 'ovenPower' } } }]
      };
      const traits = Oven.getTraits(item);
      expect(traits).toContain('action.devices.traits.OnOff');
      expect(traits).not.toContain('action.devices.traits.StartStop');
      expect(traits).not.toContain('action.devices.traits.TemperatureControl');
    });

    test('Running only', () => {
      const item = {
        type: 'Group',
        members: [{ name: 'OvenRunning', type: 'Switch', metadata: { ga: { value: 'ovenRunning' } } }]
      };
      expect(Oven.getTraits(item)).toStrictEqual(['action.devices.traits.StartStop']);
    });

    test('Temperature target only', () => {
      const item = {
        type: 'Group',
        members: [
          { name: 'OvenTemperatureTarget', type: 'Number', metadata: { ga: { value: 'ovenTemperatureTarget' } } }
        ]
      };
      expect(Oven.getTraits(item)).toStrictEqual(['action.devices.traits.TemperatureControl']);
    });

    test('Temperature ambient only', () => {
      const item = {
        type: 'Group',
        members: [
          { name: 'OvenTemperatureAmbient', type: 'Number', metadata: { ga: { value: 'ovenTemperatureAmbient' } } }
        ]
      };
      expect(Oven.getTraits(item)).toStrictEqual(['action.devices.traits.TemperatureControl']);
    });

    test('All members', () => {
      const item = {
        type: 'Group',
        members: [
          { name: 'OvenPower', type: 'Switch', metadata: { ga: { value: 'ovenPower' } } },
          { name: 'OvenRunning', type: 'Switch', metadata: { ga: { value: 'ovenRunning' } } },
          { name: 'OvenTemperatureTarget', type: 'Number', metadata: { ga: { value: 'ovenTemperatureTarget' } } }
        ]
      };
      expect(Oven.getTraits(item)).toStrictEqual([
        'action.devices.traits.OnOff',
        'action.devices.traits.StartStop',
        'action.devices.traits.TemperatureControl'
      ]);
    });
  });

  describe('getState', () => {
    test('Power', () => {
      const item = {
        members: [{ name: 'OvenPower', state: 'ON', type: 'Switch', metadata: { ga: { value: 'ovenPower' } } }]
      };
      expect(Oven.getState(item)).toStrictEqual({ on: true });
    });

    test('Power inverted', () => {
      const item = {
        metadata: { ga: { value: 'OVEN', config: { inverted: true } } },
        members: [{ name: 'OvenPower', state: 'ON', type: 'Switch', metadata: { ga: { value: 'ovenPower' } } }]
      };
      expect(Oven.getState(item)).toStrictEqual({ on: false });
    });

    test('Running', () => {
      const item = {
        members: [{ name: 'OvenRunning', state: 'ON', type: 'Switch', metadata: { ga: { value: 'ovenRunning' } } }]
      };
      expect(Oven.getState(item)).toStrictEqual({ isRunning: true, isPaused: false });
    });

    test('Temperature target', () => {
      const item = {
        members: [
          {
            name: 'OvenTemperatureTarget',
            state: '180',
            type: 'Number',
            metadata: { ga: { value: 'ovenTemperatureTarget' } }
          }
        ]
      };
      expect(Oven.getState(item)).toStrictEqual({ temperatureSetpointCelsius: 180 });
    });

    test('Temperature target and ambient, Fahrenheit', () => {
      const item = {
        metadata: { ga: { value: 'OVEN', config: { useFahrenheit: true } } },
        members: [
          {
            name: 'OvenTemperatureTarget',
            state: '350',
            type: 'Number',
            metadata: { ga: { value: 'ovenTemperatureTarget' } }
          },
          {
            name: 'OvenTemperatureAmbient',
            state: '212',
            type: 'Number',
            metadata: { ga: { value: 'ovenTemperatureAmbient' } }
          }
        ]
      };
      expect(Oven.getState(item)).toStrictEqual({
        temperatureSetpointCelsius: 176.7,
        temperatureAmbientCelsius: 100
      });
    });

    test('Invalid temperature ignored', () => {
      const item = {
        members: [
          {
            name: 'OvenTemperatureTarget',
            state: 'not-a-number',
            type: 'Number',
            metadata: { ga: { value: 'ovenTemperatureTarget' } }
          }
        ]
      };
      expect(Oven.getState(item)).toStrictEqual({});
    });
  });

  describe('getAttributes', () => {
    test('no relevant members', () => {
      expect(Oven.getAttributes({})).toStrictEqual({});
    });

    test('running only', () => {
      const item = {
        members: [{ name: 'OvenRunning', type: 'Switch', metadata: { ga: { value: 'ovenRunning' } } }]
      };
      expect(Oven.getAttributes(item)).toStrictEqual({ pausable: false });
    });

    test('temperature default range', () => {
      const item = {
        metadata: { ga: { config: {} } },
        members: [
          { name: 'OvenTemperatureTarget', type: 'Number', metadata: { ga: { value: 'ovenTemperatureTarget' } } }
        ]
      };
      expect(Oven.getAttributes(item)).toStrictEqual({
        temperatureUnitForUX: 'C',
        temperatureRange: { minThresholdCelsius: 0, maxThresholdCelsius: 300 },
        temperatureStepCelsius: 1
      });
    });

    test('temperature configured range and step', () => {
      const item = {
        metadata: { ga: { config: { temperatureRange: '50,260', temperatureStep: '5' } } },
        members: [
          { name: 'OvenTemperatureTarget', type: 'Number', metadata: { ga: { value: 'ovenTemperatureTarget' } } }
        ]
      };
      expect(Oven.getAttributes(item)).toStrictEqual({
        temperatureUnitForUX: 'C',
        temperatureRange: { minThresholdCelsius: 50, maxThresholdCelsius: 260 },
        temperatureStepCelsius: 5
      });
    });

    test('invalid (inverted or equal) temperature range falls back to default', () => {
      const item = {
        metadata: { ga: { config: { temperatureRange: '300,50' } } },
        members: [
          { name: 'OvenTemperatureTarget', type: 'Number', metadata: { ga: { value: 'ovenTemperatureTarget' } } }
        ]
      };
      expect(Oven.getAttributes(item).temperatureRange).toStrictEqual({
        minThresholdCelsius: 0,
        maxThresholdCelsius: 300
      });

      const equalItem = {
        metadata: { ga: { config: { temperatureRange: '50,50' } } },
        members: [
          { name: 'OvenTemperatureTarget', type: 'Number', metadata: { ga: { value: 'ovenTemperatureTarget' } } }
        ]
      };
      expect(Oven.getAttributes(equalItem).temperatureRange).toStrictEqual({
        minThresholdCelsius: 0,
        maxThresholdCelsius: 300
      });
    });

    test('temperature ambient only is query-only', () => {
      const item = {
        metadata: { ga: { config: {} } },
        members: [
          { name: 'OvenTemperatureAmbient', type: 'Number', metadata: { ga: { value: 'ovenTemperatureAmbient' } } }
        ]
      };
      expect(Oven.getAttributes(item)).toStrictEqual({
        temperatureUnitForUX: 'C',
        temperatureRange: { minThresholdCelsius: 0, maxThresholdCelsius: 300 },
        queryOnlyTemperatureControl: true
      });
    });
  });
});

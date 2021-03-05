const Device = require('../../functions/devices/sensor.js');

describe('Sensor Device', () => {
  test('isCompatible', () => {
    expect(
      Device.isCompatible({
        metadata: {
          ga: {
            value: 'SENSOR'
          }
        }
      })
    ).toBe(true);
  });

  describe('matchesItemType', () => {
    describe('matchesItemType numeric', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              sensorName: 'Sensor',
              valueUnit: 'PERCENT'
            }
          }
        }
      };
      expect(Device.matchesItemType(item)).toBe(true);
      expect(Device.matchesItemType({ type: 'Number' })).toBe(false);
    });

    describe('matchesItemType descriptive', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              sensorName: 'Sensor',
              states: '50=good,100=bad'
            }
          }
        }
      };
      expect(Device.matchesItemType(item)).toBe(true);
    });
  });

  describe('getAttributes', () => {
    test('getAttributes no config', () => {
      const item = {
        metadata: {
          ga: {
            config: {}
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({ sensorStatesSupported: {} });
    });

    test('getAttributes states', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              sensorName: 'Sensor',
              valueUnit: 'AQI',
              states: 'good=10,moderate=50,poor=90'
            }
          }
        }
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        sensorStatesSupported: {
          descriptiveCapabilities: {
            availableStates: ['good', 'moderate', 'poor']
          },
          name: 'Sensor',
          numericCapabilities: {
            rawValueUnit: 'AQI'
          }
        }
      });
    });
  });

  describe('getState', () => {
    test('getState', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              sensorName: 'Sensor',
              valueUnit: 'AQI',
              states: 'good=10,moderate=50,poor=90'
            }
          }
        },
        state: '10'
      };
      expect(Device.getState(item)).toStrictEqual({
        currentSensorStateData: {
          currentSensorState: 'good',
          name: 'Sensor',
          rawValue: 10
        }
      });
    });

    test('getState no matching state', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              sensorName: 'Sensor',
              valueUnit: 'AQI',
              states: 'good=10,moderate=50,poor=90'
            }
          }
        },
        state: '20'
      };
      expect(Device.getState(item)).toStrictEqual({
        currentSensorStateData: {
          currentSensorState: '',
          name: 'Sensor',
          rawValue: 20
        }
      });
    });
  });
});

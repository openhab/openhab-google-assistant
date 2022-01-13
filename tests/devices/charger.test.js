const Device = require('../../functions/devices/charger.js');

describe('Charger Device', () => {
  test('isCompatible', () => {
    expect(
      Device.isCompatible({
        metadata: {
          ga: {
            value: 'Charger'
          }
        }
      })
    ).toBe(true);
  });

  test('matchesItemType', () => {
    const item = {
      type: 'Group',
      members: [
        {
          metadata: {
            ga: {
              value: 'chargerCharging'
            }
          }
        }
      ]
    };
    expect(Device.matchesItemType(item)).toBe(true);
    expect(Device.matchesItemType({ type: 'Group' })).toBe(false);
  });

  describe('getAttributes', () => {
    test('getAttributes no config', () => {
      const item = {
        metadata: {
          ga: {
            config: {}
          }
        },
        members: [
          {
            metadata: {
              ga: {
                value: 'chargerCapacityRemaining'
              }
            }
          }
        ]
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        isRechargeable: false,
        queryOnlyEnergyStorage: true
      });
    });

    test('getAttributes with charging', () => {
      const item = {
        metadata: {
          ga: {
            config: {}
          }
        },
        members: [
          {
            metadata: {
              ga: {
                value: 'chargerCharging'
              }
            }
          }
        ]
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        isRechargeable: false,
        queryOnlyEnergyStorage: false
      });
    });

    test('getAttributes with charging', () => {
      const item = {
        metadata: {
          ga: {
            config: {
              isRechargeable: true
            }
          }
        },
        members: [
          {
            metadata: {
              ga: {
                value: 'chargerCharging'
              }
            }
          }
        ]
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        isRechargeable: true,
        queryOnlyEnergyStorage: false
      });
    });
  });

  test('getMembers', () => {
    expect(Device.getMembers({ members: [{}] })).toStrictEqual({});
    expect(Device.getMembers({ members: [{ metadata: { ga: { value: 'invalid' } } }] })).toStrictEqual({});
    const item = {
      members: [
        {
          name: 'Charging',
          state: 'ON',
          metadata: {
            ga: {
              value: 'chargerCharging'
            }
          }
        },
        {
          name: 'CapacityRemaining',
          state: '40',
          metadata: {
            ga: {
              value: 'chargerCapacityRemaining'
            }
          }
        },
        {
          name: 'CapacityUntilFull',
          state: '60',
          metadata: {
            ga: {
              value: 'chargerCapacityUntilFull'
            }
          }
        }
      ]
    };
    expect(Device.getMembers(item)).toStrictEqual({
      chargerCharging: {
        name: 'Charging',
        state: 'ON'
      },
      chargerCapacityRemaining: {
        name: 'CapacityRemaining',
        state: '40'
      },
      chargerCapacityUntilFull: {
        name: 'CapacityUntilFull',
        state: '60'
      }
    });
  });

  describe('getState', () => {
    test('getState default unit', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'Charger',
            config: {}
          }
        },
        members: [
          {
            name: 'Charging',
            state: 'ON',
            metadata: {
              ga: {
                value: 'chargerCharging'
              }
            }
          },
          {
            name: 'CapacityRemaining',
            state: '60',
            metadata: {
              ga: {
                value: 'chargerCapacityRemaining'
              }
            }
          },
          {
            name: 'CapacityUntilFull',
            state: '40',
            metadata: {
              ga: {
                value: 'chargerCapacityUntilFull'
              }
            }
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        capacityRemaining: [
          {
            rawValue: 60,
            unit: 'PERCENTAGE'
          }
        ],
        capacityUntilFull: [
          {
            rawValue: 40,
            unit: 'PERCENTAGE'
          }
        ],
        descriptiveCapacityRemaining: 'MEDIUM',
        isCharging: true
      });

      item.members[1].state = '10';
      expect(Device.getState(item)).toStrictEqual({
        capacityRemaining: [
          {
            rawValue: 10,
            unit: 'PERCENTAGE'
          }
        ],
        capacityUntilFull: [
          {
            rawValue: 40,
            unit: 'PERCENTAGE'
          }
        ],
        descriptiveCapacityRemaining: 'CRITICALLY_LOW',
        isCharging: true
      });

      item.members[1].state = '22';
      expect(Device.getState(item)).toStrictEqual({
        capacityRemaining: [
          {
            rawValue: 22,
            unit: 'PERCENTAGE'
          }
        ],
        capacityUntilFull: [
          {
            rawValue: 40,
            unit: 'PERCENTAGE'
          }
        ],
        descriptiveCapacityRemaining: 'LOW',
        isCharging: true
      });

      item.members[1].state = '80';
      expect(Device.getState(item)).toStrictEqual({
        capacityRemaining: [
          {
            rawValue: 80,
            unit: 'PERCENTAGE'
          }
        ],
        capacityUntilFull: [
          {
            rawValue: 40,
            unit: 'PERCENTAGE'
          }
        ],
        descriptiveCapacityRemaining: 'HIGH',
        isCharging: true
      });

      item.members[1].state = '100';
      expect(Device.getState(item)).toStrictEqual({
        capacityRemaining: [
          {
            rawValue: 100,
            unit: 'PERCENTAGE'
          }
        ],
        capacityUntilFull: [
          {
            rawValue: 40,
            unit: 'PERCENTAGE'
          }
        ],
        descriptiveCapacityRemaining: 'FULL',
        isCharging: true
      });
    });

    test('getState KILOWATT_HOURS unit', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'Charger',
            config: {
              unit: 'KILOWATT_HOURS'
            }
          }
        },
        members: [
          {
            name: 'Charging',
            state: 'OFF',
            metadata: {
              ga: {
                value: 'chargerCharging'
              }
            }
          },
          {
            name: 'PluggedIn',
            state: 'ON',
            metadata: {
              ga: {
                value: 'chargerPluggedIn'
              }
            }
          },
          {
            name: 'CapacityRemaining',
            state: '4000',
            metadata: {
              ga: {
                value: 'chargerCapacityRemaining'
              }
            }
          },
          {
            name: 'CapacityUntilFull',
            state: '6000',
            metadata: {
              ga: {
                value: 'chargerCapacityUntilFull'
              }
            }
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        capacityRemaining: [
          {
            rawValue: 4000,
            unit: 'KILOWATT_HOURS'
          }
        ],
        capacityUntilFull: [
          {
            rawValue: 6000,
            unit: 'KILOWATT_HOURS'
          }
        ],
        isCharging: false,
        isPluggedIn: true
      });
    });
  });
});

const SecuritySystem = require('../../functions/devices/securitysystem.js');
const Device = require('../../functions/devices/securitysystem.js');

describe('SecuritySystem Device', () => {
  test('matchesDeviceType', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'SECURITYSYSTEM'
          }
        }
      })
    ).toBe(false);
    expect(
      Device.matchesDeviceType({
        type: 'Group',
        members: [
          {
            type: 'Switch',
            metadata: {
              ga: {
                value: SecuritySystem.armedMemberName
              }
            }
          }
        ],
        metadata: {
          ga: {
            value: 'SECURITYSYSTEM'
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
          type: 'Switch',
          metadata: {
            ga: {
              value: SecuritySystem.armedMemberName
            }
          }
        }
      ]
    };
    expect(Device.matchesItemType(item)).toBe(true);
    expect(Device.matchesItemType({ type: 'Switch' })).toBe(false);
    expect(Device.matchesItemType({ type: 'String' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Switch' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'String' })).toBe(false);
  });

  test('getTraits', () => {
    expect(Device.getTraits()).toStrictEqual(['action.devices.traits.ArmDisarm', 'action.devices.traits.StatusReport']);
  });

  describe('getState', () => {
    test('getState without armLevel', () => {
      const device = {
        type: 'Group',
        members: [
          {
            type: 'Switch',
            metadata: {
              ga: {
                value: Device.armedMemberName
              }
            },
            state: 'ON'
          }
        ]
      };
      expect(Device.getState(device)).toStrictEqual({
        currentStatusReport: [],
        isArmed: true
      });

      device.members[0].state = 'OFF';
      expect(Device.getState(device)).toStrictEqual({
        currentStatusReport: [],
        isArmed: false
      });
    });

    test('getState without armed', () => {
      const device = {
        members: [
          {
            type: 'String',
            metadata: {
              ga: {
                value: Device.armLevelMemberName
              }
            },
            state: 'L1'
          }
        ]
      };
      expect(Device.getState(device)).toStrictEqual({
        isArmed: false
      });

      device.members[0].state = 'OFF';
      expect(Device.getState(device)).toStrictEqual({
        isArmed: false
      });
    });

    test('getState with armLevel', () => {
      const device = {
        members: [
          {
            type: 'Switch',
            metadata: {
              ga: {
                value: Device.armedMemberName
              }
            },
            state: 'ON'
          },
          {
            type: 'String',
            metadata: {
              ga: {
                value: Device.armLevelMemberName
              }
            },
            state: 'L1'
          }
        ]
      };
      expect(Device.getState(device)).toStrictEqual({
        isArmed: true,
        currentArmLevel: 'L1',
        currentStatusReport: []
      });

      device.members[0].state = 'OFF';
      expect(Device.getState(device)).toStrictEqual({
        isArmed: false,
        currentStatusReport: []
      });
    });

    test('getState inverted', () => {
      const item = {
        members: [
          {
            type: 'Switch',
            metadata: {
              ga: {
                value: Device.armedMemberName
              }
            },
            state: 'ON'
          }
        ],
        metadata: {
          ga: {
            config: {
              inverted: true
            }
          }
        }
      };

      expect(Device.getState(item)).toStrictEqual({
        isArmed: false,
        currentStatusReport: []
      });
    });
  });

  describe('getAttributes', () => {
    test('just a switch with no config', () => {
      const device = {
        metadata: {
          ga: {
            config: {}
          }
        }
      };
      const attributes = Device.getAttributes(device);
      expect(attributes).toStrictEqual({});
    });

    test('no arm levels defined', () => {
      const device = {
        metadata: {
          ga: {
            config: {
              lang: 'de',
              ordered: true
            }
          }
        }
      };
      const attributes = Device.getAttributes(device);
      expect(attributes).toStrictEqual({});
    });

    test('armLevels, 1 level with lang and ordered set', () => {
      const device = {
        metadata: {
          ga: {
            config: {
              armLevels: 'L1=Stay',
              lang: 'de',
              ordered: true
            }
          }
        }
      };
      const attributes = Device.getAttributes(device);
      expect(attributes.availableArmLevels).toBeDefined();
      expect(attributes.availableArmLevels.ordered).toBe(true);

      expect(attributes.availableArmLevels.levels).toBeDefined();
      const levels = attributes.availableArmLevels.levels;

      expect(levels).toStrictEqual([
        {
          level_name: 'L1',
          level_values: [
            {
              level_synonym: ['Stay'],
              lang: 'de'
            }
          ]
        }
      ]);
    });

    test('armLevels, 1 level with default ordered value', () => {
      const device = {
        metadata: {
          ga: {
            config: {
              armLevels: 'L1=Stay',
              lang: 'en'
            }
          }
        }
      };
      const attributes = Device.getAttributes(device);
      expect(attributes.availableArmLevels).toBeDefined();
      expect(attributes.availableArmLevels.ordered).toBe(false);
    });

    test('armLevels, 1 level with default lang', () => {
      const device = {
        metadata: {
          ga: {
            config: {
              armLevels: 'L1=Stay'
            }
          }
        }
      };
      const attributes = Device.getAttributes(device);

      expect(attributes.availableArmLevels.levels).toBeDefined();
      const levels = attributes.availableArmLevels.levels;

      expect(levels).toStrictEqual([
        {
          level_name: 'L1',
          level_values: [
            {
              level_synonym: ['Stay'],
              lang: 'en'
            }
          ]
        }
      ]);
    });

    test('armLevels, multiple levels', () => {
      const device = {
        metadata: {
          ga: {
            config: {
              armLevels: 'L1=Stay,L2=Night,L3=Away',
              lang: 'en',
              ordered: true
            }
          }
        }
      };
      const attributes = Device.getAttributes(device);
      expect(attributes.availableArmLevels).toBeDefined();
      expect(attributes.availableArmLevels.ordered).toBe(true);

      expect(attributes.availableArmLevels.levels).toBeDefined();
      const levels = attributes.availableArmLevels.levels;

      expect(levels).toStrictEqual([
        {
          level_name: 'L1',
          level_values: [
            {
              level_synonym: ['Stay'],
              lang: 'en'
            }
          ]
        },
        {
          level_name: 'L2',
          level_values: [
            {
              level_synonym: ['Night'],
              lang: 'en'
            }
          ]
        },
        {
          level_name: 'L3',
          level_values: [
            {
              level_synonym: ['Away'],
              lang: 'en'
            }
          ]
        }
      ]);
    });
  });

  describe('getMembers', () => {
    const memberArmed = 'securitySystemArmed';
    const memberArmLevel = 'securitySystemArmLevel';
    const memberZone = 'securitySystemZone';
    const memberTrouble = 'securitySystemTrouble';
    const memberErrorCode = 'securitySystemTroubleCode';

    test('member without ga metadata', () => {
      const device = {
        members: [
          {
            name: 'armed',
            type: 'Switch',
            metadata: {
              ga: {
                value: memberArmed
              }
            },
            state: 'ON'
          },
          {
            name: 'someOtherMember',
            state: 'L1'
          }
        ]
      };
      const members = Device.getMembers(device);
      const expectedMembers = {};
      expectedMembers[memberArmed] = { name: 'armed', state: 'ON', config: {} };

      expect(members).toStrictEqual(expectedMembers);
    });

    test('member with ga metadata but not an alarm item', () => {
      const device = {
        members: [
          {
            name: 'armed',
            metadata: {
              ga: {
                value: 'someOtherMember'
              }
            },
            state: 'ON'
          }
        ]
      };
      const members = Device.getMembers(device);
      const expectedMembers = {};
      expect(members).toStrictEqual(expectedMembers);
    });

    test('all possible members defined with no extra config', () => {
      const device = {
        members: [
          {
            name: 'armed',
            type: 'Switch',
            metadata: {
              ga: {
                value: memberArmed
              }
            },
            state: 'ON'
          },
          {
            name: 'armLevel',
            type: 'String',
            metadata: {
              ga: {
                value: memberArmLevel
              }
            },
            state: 'L1'
          },
          {
            name: 'trouble',
            type: 'Switch',
            metadata: {
              ga: {
                value: memberTrouble
              }
            },
            state: 'OFF'
          },
          {
            name: 'errorCode',
            type: 'String',
            metadata: {
              ga: {
                value: memberErrorCode
              }
            },
            state: 'ErrorCode123'
          },
          {
            name: 'zone1',
            type: 'Contact',
            metadata: {
              ga: {
                value: memberZone
              }
            },
            state: 'OPEN'
          }
        ]
      };
      const members = Device.getMembers(device);
      const expectedMembers = {};
      expectedMembers[memberArmed] = { name: 'armed', state: 'ON', config: {} };
      expectedMembers[memberArmLevel] = { name: 'armLevel', state: 'L1', config: {} };
      expectedMembers[memberTrouble] = { name: 'trouble', state: 'OFF', config: {} };
      expectedMembers[memberErrorCode] = { name: 'errorCode', state: 'ErrorCode123', config: {} };
      expectedMembers.zones = [{ name: 'zone1', state: 'OPEN', config: {} }];
      expect(members).toStrictEqual(expectedMembers);
    });

    test('bare minimum members', () => {
      const device = {
        members: [
          {
            name: 'armed',
            type: 'Switch',
            metadata: {
              ga: {
                value: memberArmed
              }
            },
            state: 'ON'
          }
        ]
      };
      const members = Device.getMembers(device);
      const expectedMembers = {};
      expectedMembers[memberArmed] = { name: 'armed', state: 'ON', config: {} };
      expect(members).toStrictEqual(expectedMembers);
    });

    test('zones with extra config', () => {
      const device = {
        members: [
          {
            name: 'zone1',
            type: 'Contact',
            metadata: {
              ga: {
                value: memberZone,
                config: { zoneType: 'OpenClose' }
              }
            },
            state: 'OPEN'
          }
        ]
      };
      const members = Device.getMembers(device);
      const expectedMembers = {};
      expectedMembers.zones = [{ name: 'zone1', state: 'OPEN', config: { zoneType: 'OpenClose' } }];
      expect(members).toStrictEqual(expectedMembers);
    });
  });

  describe('getStatusReport', () => {
    const memberZone = 'securitySystemZone';
    const memberTrouble = 'securitySystemTrouble';
    const memberErrorCode = 'securitySystemTroubleCode';

    test('trouble', () => {
      const device = {
        name: 'alarm',
        members: [
          {
            name: 'trouble',
            type: 'Switch',
            metadata: {
              ga: {
                value: memberTrouble
              }
            },
            state: 'ON'
          },
          {
            name: 'errorCode',
            type: 'String',
            metadata: {
              ga: {
                value: memberErrorCode
              }
            },
            state: 'ErrorCode123'
          }
        ]
      };
      expect(Device.getStatusReport(device, Device.getMembers(device))).toStrictEqual([
        {
          blocking: false,
          deviceTarget: 'alarm',
          priority: 0,
          statusCode: 'ErrorCode123'
        }
      ]);
    });

    test('zones', () => {
      const device = {
        name: 'alarm',
        members: [
          {
            name: 'zone1',
            type: 'Contact',
            metadata: {
              ga: {
                value: memberZone,
                config: {
                  zoneType: 'OpenClose',
                  blocking: true
                }
              }
            },
            state: 'OPEN'
          },
          {
            name: 'zone2',
            type: 'Contact',
            metadata: {
              ga: {
                value: memberZone,
                config: {
                  zoneType: 'Motion',
                  blocking: false
                }
              }
            },
            state: 'OPEN'
          },
          {
            name: 'zone3',
            type: 'Contact',
            metadata: {
              ga: {
                value: memberZone,
                config: {
                  zoneType: 'OpenClose',
                  blocking: true
                }
              }
            },
            state: 'CLOSED'
          }
        ]
      };

      expect(Device.getStatusReport(device, Device.getMembers(device))).toStrictEqual([
        {
          blocking: true,
          deviceTarget: 'zone1',
          priority: 1,
          statusCode: 'deviceOpen'
        },
        {
          blocking: false,
          deviceTarget: 'zone2',
          priority: 1,
          statusCode: 'motionDetected'
        }
      ]);
    });
  });
});

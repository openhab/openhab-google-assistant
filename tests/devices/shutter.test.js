const Device = require('../../functions/devices/shutter.js');

describe('Shutter Device', () => {
  describe('basic OpenClose functionality', () => {
    test('getTraits simple shutter', () => {
      const item = { type: 'Rollershutter' };
      const traits = Device.getTraits(item);
      expect(traits).toContain('action.devices.traits.OpenClose');
      expect(traits).toContain('action.devices.traits.StartStop');
      expect(traits).not.toContain('action.devices.traits.Rotation');
    });

    test('getAttributes simple shutter', () => {
      const item = { type: 'Rollershutter' };
      const attributes = Device.getAttributes(item);
      expect(attributes.pausable).toBe(false);
      expect(attributes.discreteOnlyOpenClose).toBe(false);
      expect(attributes.queryOnlyOpenClose).toBe(false);
      expect(attributes.supportsDegrees).toBeUndefined();
      expect(attributes.supportsPercent).toBeUndefined();
    });

    test('getState simple shutter', () => {
      const item = { type: 'Rollershutter', state: '30' };
      const state = Device.getState(item);
      expect(state.openPercent).toBe(70); // 100 - 30
      expect(state.rotationPercent).toBeUndefined();
      expect(state.rotationDegrees).toBeUndefined();
    });
  });

  describe('rotation trait - group configuration only', () => {
    test('getTraits group with shutterRotation member', () => {
      const item = {
        type: 'Group',
        members: [
          {
            name: 'TestShutter_Position',
            type: 'Rollershutter',
            state: '50',
            metadata: {
              ga: {
                value: 'shutterPosition'
              }
            }
          },
          {
            name: 'TestShutter_Rotation',
            type: 'Number',
            state: '30',
            metadata: {
              ga: {
                value: 'shutterRotation'
              }
            }
          }
        ]
      };
      const traits = Device.getTraits(item);
      expect(traits).toContain('action.devices.traits.OpenClose');
      expect(traits).toContain('action.devices.traits.StartStop');
      expect(traits).toContain('action.devices.traits.Rotation');
    });

    test('getTraits group without shutterRotation member', () => {
      const item = {
        type: 'Group',
        members: [
          {
            name: 'TestShutter_Position',
            type: 'Rollershutter',
            state: '50',
            metadata: {
              ga: {
                value: 'shutterPosition'
              }
            }
          }
        ]
      };
      const traits = Device.getTraits(item);
      expect(traits).toContain('action.devices.traits.OpenClose');
      expect(traits).toContain('action.devices.traits.StartStop');
      expect(traits).not.toContain('action.devices.traits.Rotation');
    });

    test('getTraits single item does not support rotation', () => {
      const item = {
        type: 'Rollershutter',
        metadata: {
          ga: {
            config: {
              supportsDegrees: true,
              supportsPercent: true
            }
          }
        }
      };
      const traits = Device.getTraits(item);
      expect(traits).toContain('action.devices.traits.OpenClose');
      expect(traits).toContain('action.devices.traits.StartStop');
      expect(traits).not.toContain('action.devices.traits.Rotation');
    });

    test('getAttributes with rotation support', () => {
      const item = {
        type: 'Group',
        members: [
          {
            name: 'TestShutter_Rotation',
            type: 'Number',
            state: '30',
            metadata: {
              ga: {
                value: 'shutterRotation'
              }
            }
          }
        ]
      };
      const attributes = Device.getAttributes(item);
      expect(attributes.supportsDegrees).toBe(true);
      expect(attributes.supportsPercent).toBe(true);
      expect(attributes.rotationDegreesRange.rotationDegreesMin).toBe(0);
      expect(attributes.rotationDegreesRange.rotationDegreesMax).toBe(90);
    });

    test('getAttributes with custom rotation range', () => {
      const item = {
        type: 'Group',
        members: [
          {
            name: 'TestShutter_Rotation',
            type: 'Number',
            state: '30',
            metadata: {
              ga: {
                value: 'shutterRotation'
              }
            }
          }
        ],
        metadata: {
          ga: {
            config: {
              rotationDegreesMin: -45,
              rotationDegreesMax: 45
            }
          }
        }
      };
      const attributes = Device.getAttributes(item);
      expect(attributes.rotationDegreesRange.rotationDegreesMin).toBe(-45);
      expect(attributes.rotationDegreesRange.rotationDegreesMax).toBe(45);
    });

    test('getAttributes with supportsContinuousRotation enabled', () => {
      const item = {
        type: 'Group',
        members: [
          {
            name: 'TestShutter_Rotation',
            type: 'Number',
            state: '30',
            metadata: {
              ga: {
                value: 'shutterRotation'
              }
            }
          }
        ],
        metadata: {
          ga: {
            config: {
              supportsContinuousRotation: true
            }
          }
        }
      };
      const attributes = Device.getAttributes(item);
      expect(attributes.supportsContinuousRotation).toBe(true);
    });

    test('getAttributes with supportsContinuousRotation disabled (default)', () => {
      const item = {
        type: 'Group',
        members: [
          {
            name: 'TestShutter_Rotation',
            type: 'Number',
            state: '30',
            metadata: {
              ga: {
                value: 'shutterRotation'
              }
            }
          }
        ]
      };
      const attributes = Device.getAttributes(item);
      expect(attributes.supportsContinuousRotation).toBeUndefined();
    });

    test('getState with rotation support', () => {
      const item = {
        type: 'Group',
        state: 'NULL',
        members: [
          {
            name: 'TestShutter_Rotation',
            type: 'Number',
            state: '30',
            metadata: {
              ga: {
                value: 'shutterRotation'
              }
            }
          }
        ]
      };
      const state = Device.getState(item);
      expect(state.openPercent).toBe(0); // Group without shutterPosition falls back to parent logic with NULL state
      expect(state.rotationPercent).toBe(30); // From shutterRotation member
      expect(state.rotationDegrees).toBe(27); // 30% of 0-90 range
    });

    test('getState with rotation support and inversion', () => {
      const item = {
        type: 'Group',
        state: 'NULL',
        members: [
          {
            name: 'TestShutter_Rotation',
            type: 'Number',
            state: '30',
            metadata: {
              ga: {
                value: 'shutterRotation'
              }
            }
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
      const state = Device.getState(item);
      expect(state.openPercent).toBe(100); // With inversion: state=100, inverted result is state itself
      expect(state.rotationPercent).toBe(70); // Rotation trait: inverted
      expect(state.rotationDegrees).toBe(63); // 70% of 0-90 range
    });
  });

  describe('group configuration with rotation member', () => {
    test('getTraits group with shutterRotation member', () => {
      const item = {
        type: 'Group',
        members: [
          {
            name: 'TestShutter_Position',
            type: 'Rollershutter',
            state: '50',
            metadata: {
              ga: {
                value: 'shutterPosition'
              }
            }
          },
          {
            name: 'TestShutter_Rotation',
            type: 'Number',
            state: '30',
            metadata: {
              ga: {
                value: 'shutterRotation'
              }
            }
          }
        ]
      };
      const traits = Device.getTraits(item);
      expect(traits).toContain('action.devices.traits.OpenClose');
      expect(traits).toContain('action.devices.traits.StartStop');
      expect(traits).toContain('action.devices.traits.Rotation');
    });

    test('matchesDeviceType group with members', () => {
      const item = {
        type: 'Group',
        metadata: {
          ga: {
            value: 'SHUTTER'
          }
        },
        members: [
          {
            name: 'TestShutter_Position',
            type: 'Rollershutter',
            state: '50',
            metadata: {
              ga: {
                value: 'shutterPosition'
              }
            }
          }
        ]
      };
      expect(Device.matchesDeviceType(item)).toBe(true);
    });

    test('matchesDeviceType group without members', () => {
      const item = {
        type: 'Group',
        members: []
      };
      expect(Device.matchesDeviceType(item)).toBe(false);
    });

    test('getState group with shutterRotation member', () => {
      const item = {
        type: 'Group',
        members: [
          {
            name: 'TestShutter_Position',
            type: 'Rollershutter',
            state: '50',
            metadata: {
              ga: {
                value: 'shutterPosition'
              }
            }
          },
          {
            name: 'TestShutter_Rotation',
            type: 'Number',
            state: '30',
            metadata: {
              ga: {
                value: 'shutterRotation'
              }
            }
          }
        ]
      };
      const state = Device.getState(item);
      expect(state.openPercent).toBe(50); // From shutterPosition member: 100 - 50
      expect(state.rotationPercent).toBe(30); // From shutterRotation member
      expect(state.rotationDegrees).toBe(27); // 30% of 0-90 range
    });

    test('getState group with shutterRotation and inversion', () => {
      const item = {
        type: 'Group',
        members: [
          {
            name: 'TestShutter_Rotation',
            type: 'Number',
            state: '40',
            metadata: {
              ga: {
                value: 'shutterRotation'
              }
            }
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
      const state = Device.getState(item);
      expect(state.rotationPercent).toBe(60); // Inverted: 100 - 40
      expect(state.rotationDegrees).toBe(54); // 60% of 0-90 range
    });

    test('getAttributes with supportsDegrees disabled', () => {
      const item = {
        type: 'Group',
        members: [
          {
            name: 'TestShutter_Rotation',
            type: 'Number',
            state: '30',
            metadata: {
              ga: {
                value: 'shutterRotation'
              }
            }
          }
        ],
        metadata: {
          ga: {
            config: {
              supportsDegrees: false
            }
          }
        }
      };
      const attributes = Device.getAttributes(item);
      expect(attributes.supportsDegrees).toBe(false);
      expect(attributes.supportsPercent).toBe(true);
      expect(attributes.rotationDegreesRange).toBeUndefined();
    });

    test('getState with supportsDegrees disabled', () => {
      const item = {
        type: 'Group',
        state: 'NULL',
        members: [
          {
            name: 'TestShutter_Rotation',
            type: 'Number',
            state: '30',
            metadata: {
              ga: {
                value: 'shutterRotation'
              }
            }
          }
        ],
        metadata: {
          ga: {
            config: {
              supportsDegrees: false
            }
          }
        }
      };
      const state = Device.getState(item);
      expect(state.rotationPercent).toBe(30);
      expect(state.rotationDegrees).toBeUndefined();
    });

    test('getMetadata with rotation config', () => {
      const item = {
        type: 'Group',
        members: [
          {
            name: 'TestShutter_Rotation',
            type: 'Number',
            state: '30',
            metadata: {
              ga: {
                value: 'shutterRotation'
              }
            }
          }
        ],
        metadata: {
          ga: {
            config: {
              rotationDegreesMin: 10,
              rotationDegreesMax: 180
            }
          }
        }
      };
      const metadata = Device.getMetadata(item);
      expect(metadata.customData.rotationConfig).toBeDefined();
      expect(metadata.customData.rotationConfig.supportsDegrees).toBe(true);
      expect(metadata.customData.rotationConfig.rotationDegreesMin).toBe(10);
      expect(metadata.customData.rotationConfig.rotationDegreesMax).toBe(180);
    });

    test('getMetadata with supportsDegrees disabled - no degree range stored', () => {
      const item = {
        type: 'Group',
        members: [
          {
            name: 'TestShutter_Rotation',
            type: 'Number',
            state: '30',
            metadata: {
              ga: {
                value: 'shutterRotation'
              }
            }
          }
        ],
        metadata: {
          ga: {
            config: {
              supportsDegrees: false
            }
          }
        }
      };
      const metadata = Device.getMetadata(item);
      expect(metadata.customData.rotationConfig).toBeDefined();
      expect(metadata.customData.rotationConfig.supportsDegrees).toBe(false);
      expect(metadata.customData.rotationConfig.rotationDegreesMin).toBeUndefined();
      expect(metadata.customData.rotationConfig.rotationDegreesMax).toBeUndefined();
    });
  });

  describe('requiredItemTypes', () => {
    test('requiredItemTypes includes Group', () => {
      expect(Device.requiredItemTypes).toContain('Group');
      expect(Device.requiredItemTypes).toContain('Rollershutter');
      expect(Device.requiredItemTypes).toContain('Switch');
      expect(Device.requiredItemTypes).toContain('Contact');
    });
  });
});

const { DEVICE_REGISTRY } = require('../../functions/deviceRegistry.js');

// Find DynamicModesLight in the registry
const Device = DEVICE_REGISTRY.find((d) => d.name === 'DynamicModesLight');

describe('DynamicModesLight Device', () => {
  test('device exists in registry', () => {
    expect(Device).toBeDefined();
    expect(Device.name).toBe('DynamicModesLight');
  });

  test('has correct device type', () => {
    expect(Device.type).toBe('action.devices.types.LIGHT');
  });

  test('requires Group item type', () => {
    expect(Device.requiredItemTypes).toContain('Group');
  });

  test('matchesDeviceType with LIGHT metadata and mode config', () => {
    expect(
      Device.matchesDeviceType({
        type: 'Group',
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {
              mode: 'preset,mode'
            }
          }
        },
        members: [
          {
            name: 'Settings',
            state: 'none=None,preset1=Preset 1,preset2=Preset 2',
            type: 'String',
            metadata: {
              ga: {
                value: 'modesSettings'
              }
            }
          },
          {
            name: 'CurrentMode',
            state: 'none',
            type: 'String',
            metadata: {
              ga: {
                value: 'modesCurrentMode'
              }
            }
          }
        ]
      })
    ).toBe(true);
  });

  test('does not match without mode config', () => {
    expect(
      Device.matchesDeviceType({
        type: 'Group',
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {}
          }
        },
        members: [
          {
            name: 'Settings',
            state: 'none=None,preset1=Preset 1',
            type: 'String',
            metadata: {
              ga: {
                value: 'modesSettings'
              }
            }
          }
        ]
      })
    ).toBe(false);
  });

  test('does not match without modesSettings member', () => {
    expect(
      Device.matchesDeviceType({
        type: 'Group',
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {
              mode: 'preset,mode'
            }
          }
        },
        members: [
          {
            name: 'CurrentMode',
            state: 'none',
            type: 'String',
            metadata: {
              ga: {
                value: 'modesCurrentMode'
              }
            }
          }
        ]
      })
    ).toBe(false);
  });

  test('does not match with invalid modesSettings format', () => {
    expect(
      Device.matchesDeviceType({
        type: 'Group',
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {
              mode: 'preset,mode'
            }
          }
        },
        members: [
          {
            name: 'Settings',
            state: 'invalid_format_without_equals',
            type: 'String',
            metadata: {
              ga: {
                value: 'modesSettings'
              }
            }
          }
        ]
      })
    ).toBe(false);
  });

  test('does not match different device type', () => {
    expect(
      Device.matchesDeviceType({
        type: 'Group',
        metadata: {
          ga: {
            value: 'SWITCH',
            config: {
              mode: 'preset,mode'
            }
          }
        },
        members: [
          {
            name: 'Settings',
            state: 'none=None,preset1=Preset 1',
            type: 'String',
            metadata: {
              ga: {
                value: 'modesSettings'
              }
            }
          }
        ]
      })
    ).toBe(false);
  });

  test('getMetadata', () => {
    const metadata = Device.getMetadata({
      type: 'Group',
      name: 'TestDynamicModesLight',
      label: 'Test Dynamic Modes Light',
      metadata: {
        ga: {
          value: 'LIGHT',
          config: {
            mode: 'preset,mode'
          }
        }
      },
      members: [
        {
          name: 'Settings',
          state: 'none=None,preset1=Preset 1',
          type: 'String',
          metadata: {
            ga: {
              value: 'modesSettings'
            }
          }
        }
      ]
    });
    expect(metadata.customData.deviceType).toBe('DynamicModesLight');
    expect(metadata.type).toBe('action.devices.types.LIGHT');
  });

  test('inherits DynamicModesDevice traits', () => {
    expect(Device.getTraits()).toContain('action.devices.traits.Modes');
  });

  test('inherits DynamicModesDevice attributes', () => {
    const item = {
      type: 'Group',
      metadata: {
        ga: {
          config: {
            mode: 'preset,mode',
            ordered: true
          }
        }
      },
      members: [
        {
          name: 'Settings',
          state: 'low=Low,medium=Medium:Med,high=High',
          type: 'String',
          metadata: {
            ga: {
              value: 'modesSettings'
            }
          }
        }
      ]
    };
    const attributes = Device.getAttributes(item);
    expect(attributes).toHaveProperty('availableModes');
    expect(attributes.availableModes[0].name).toBe('preset');
    expect(attributes.availableModes[0].ordered).toBe(true);
    expect(attributes.availableModes[0].settings).toHaveLength(3);
  });

  test('inherits DynamicModesDevice state', () => {
    const item = {
      type: 'Group',
      metadata: {
        ga: {
          config: {
            mode: 'preset,mode'
          }
        }
      },
      members: [
        {
          name: 'CurrentMode',
          state: 'low',
          type: 'String',
          metadata: {
            ga: {
              value: 'modesCurrentMode'
            }
          }
        },
        {
          name: 'Settings',
          state: 'low=Low,medium=Medium,high=High',
          type: 'String',
          metadata: {
            ga: {
              value: 'modesSettings'
            }
          }
        }
      ]
    };
    const state = Device.getState(item);
    expect(state).toHaveProperty('currentModeSettings');
    expect(state.currentModeSettings.preset).toBe('low');
  });
});

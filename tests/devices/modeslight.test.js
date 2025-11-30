const { DEVICE_REGISTRY } = require('../../functions/deviceRegistry.js');

// Find ModesLight in the registry
const Device = DEVICE_REGISTRY.find((d) => d.name === 'ModesLight');

describe('ModesLight Device', () => {
  test('device exists in registry', () => {
    expect(Device).toBeDefined();
    expect(Device.name).toBe('ModesLight');
  });

  test('has correct device type', () => {
    expect(Device.type).toBe('action.devices.types.LIGHT');
  });

  test('matchesDeviceType with LIGHT metadata and mode config', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {
              mode: 'preset,mode',
              settings: 'none=None,preset1=Preset 1,preset2=Preset 2'
            }
          }
        }
      })
    ).toBe(true);
  });

  test('does not match without mode config', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {}
          }
        }
      })
    ).toBe(false);
  });

  test('does not match without settings config', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'LIGHT',
            config: {
              mode: 'preset,mode'
            }
          }
        }
      })
    ).toBe(false);
  });

  test('does not match different device type', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'SWITCH',
            config: {
              mode: 'preset,mode',
              settings: 'none=None,preset1=Preset 1'
            }
          }
        }
      })
    ).toBe(false);
  });

  test('getMetadata', () => {
    const metadata = Device.getMetadata({
      type: 'String',
      name: 'TestModesLight',
      label: 'Test Modes Light',
      metadata: {
        ga: {
          value: 'LIGHT',
          config: {
            mode: 'preset,mode',
            settings: 'none=None,preset1=Preset 1'
          }
        }
      }
    });
    expect(metadata.customData.deviceType).toBe('ModesLight');
    expect(metadata.type).toBe('action.devices.types.LIGHT');
  });

  test('inherits ModesDevice traits', () => {
    expect(Device.getTraits()).toContain('action.devices.traits.Modes');
  });

  test('inherits ModesDevice attributes', () => {
    const item = {
      metadata: {
        ga: {
          config: {
            mode: 'preset,mode',
            settings: 'low=Low,medium=Medium:Med,high=High',
            ordered: true
          }
        }
      }
    };
    const attributes = Device.getAttributes(item);
    expect(attributes).toHaveProperty('availableModes');
    expect(attributes.availableModes[0].name).toBe('preset');
    expect(attributes.availableModes[0].ordered).toBe(true);
    expect(attributes.availableModes[0].settings).toHaveLength(3);
  });

  test('inherits ModesDevice state', () => {
    const item = {
      state: 'low',
      metadata: {
        ga: {
          config: {
            mode: 'preset,mode',
            settings: 'low=Low,medium=Medium,high=High'
          }
        }
      }
    };
    const state = Device.getState(item);
    expect(state).toHaveProperty('currentModeSettings');
    expect(state.currentModeSettings.preset).toBe('low');
  });
});

const Device = require('../../functions/devices/vacuum.js');

describe('Vacuum Device', () => {
  test('matchesDeviceType without members', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'VACUUM'
          }
        }
      })
    ).toBe(false);
  });

  test('matchesDeviceType with members', () => {
    expect(
      Device.matchesDeviceType({
        metadata: {
          ga: {
            value: 'VACUUM'
          }
        },
        members: [
          {
            name: 'VacuumPower',
            state: 'ON',
            type: 'Switch',
            metadata: { ga: { value: 'vacuumPower' } }
          }
        ]
      })
    ).toBe(true);
  });

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ type: 'Group' })).toBe(true);
    expect(Device.matchesItemType({ type: 'Switch' })).toBe(false);
    expect(Device.matchesItemType({ type: 'String' })).toBe(false);
    expect(Device.matchesItemType({ type: 'Group', groupType: 'Switch' })).toBe(false);
  });

  test('getState - Group with members', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'VacuumPower',
          state: 'ON',
          type: 'Switch',
          metadata: { ga: { value: 'vacuumPower' } }
        },
        {
          name: 'VacuumDock',
          state: 'OFF',
          type: 'Switch',
          metadata: { ga: { value: 'vacuumDock' } }
        },
        {
          name: 'VacuumBattery',
          state: '85',
          type: 'Number',
          metadata: { ga: { value: 'vacuumBattery' } }
        }
      ]
    };
    const state = Device.getState(item);
    expect(state.isRunning).toBe(true);
    expect(state.isDocked).toBe(false);
    expect(state.capacityRemaining[0].rawValue).toBe(85);
    expect(state.descriptiveCapacityRemaining).toBe('HIGH');
  });

  test('getState - low battery', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'VacuumBattery',
          state: '20',
          type: 'Number',
          metadata: { ga: { value: 'vacuumBattery' } }
        }
      ]
    };
    const state = Device.getState(item);
    expect(state.descriptiveCapacityRemaining).toBe('LOW');
  });

  test('getState - critically low battery', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'VacuumBattery',
          state: '10',
          type: 'Number',
          metadata: { ga: { value: 'vacuumBattery' } }
        }
      ]
    };
    const state = Device.getState(item);
    expect(state.descriptiveCapacityRemaining).toBe('CRITICALLY_LOW');
  });

  test('getState - medium battery', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'VacuumBattery',
          state: '50',
          type: 'Number',
          metadata: { ga: { value: 'vacuumBattery' } }
        }
      ]
    };
    const state = Device.getState(item);
    expect(state.descriptiveCapacityRemaining).toBe('MEDIUM');
  });

  test('getState - full battery', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'VacuumBattery',
          state: '100',
          type: 'Number',
          metadata: { ga: { value: 'vacuumBattery' } }
        }
      ]
    };
    const state = Device.getState(item);
    expect(state.descriptiveCapacityRemaining).toBe('FULL');
  });

  test('getAttributes', () => {
    const attributes = Device.getAttributes({});
    expect(attributes.pausable).toBe(false);
  });

  test('getAttributes - with battery member', () => {
    const item = {
      members: [
        {
          name: 'VacuumBattery',
          type: 'Number',
          metadata: { ga: { value: 'vacuumBattery' } }
        }
      ]
    };
    const attributes = Device.getAttributes(item);
    expect(attributes.queryOnlyEnergyStorage).toBe(true);
  });

  test('supportedMembers', () => {
    const members = Device.supportedMembers;
    expect(members.find((m) => m.name === 'vacuumPower')).toBeDefined();
    expect(members.find((m) => m.name === 'vacuumDock')).toBeDefined();
    expect(members.find((m) => m.name === 'vacuumBattery')).toBeDefined();
  });

  test('getState - with current cycle', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'VacuumCurrentCycle',
          state: 'auto_clean',
          type: 'String',
          metadata: { ga: { value: 'vacuumCurrentCycle' } }
        }
      ]
    };
    const state = Device.getState(item);
    expect(state.currentRunCycle).toStrictEqual([
      {
        currentCycle: 'auto_clean',
        lang: 'en'
      }
    ]);
  });

  test('getTraits - Group with all members', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'VacuumPower',
          type: 'Switch',
          metadata: { ga: { value: 'vacuumPower' } }
        },
        {
          name: 'VacuumDock',
          type: 'Switch',
          metadata: { ga: { value: 'vacuumDock' } }
        },
        {
          name: 'VacuumBattery',
          type: 'Number',
          metadata: { ga: { value: 'vacuumBattery' } }
        },
        {
          name: 'VacuumCurrentCycle',
          type: 'String',
          metadata: { ga: { value: 'vacuumCurrentCycle' } }
        },
        {
          name: 'VacuumLocate',
          type: 'Switch',
          metadata: { ga: { value: 'vacuumLocate' } }
        }
      ]
    };
    const traits = Device.getTraits(item);
    expect(traits).toContain('action.devices.traits.StartStop');
    expect(traits).toContain('action.devices.traits.Dock');
    expect(traits).toContain('action.devices.traits.RunCycle');
    expect(traits).toContain('action.devices.traits.Locator');
    expect(traits).toContain('action.devices.traits.EnergyStorage');
  });

  test('getTraits - Group with minimal members', () => {
    const item = {
      type: 'Group',
      members: [
        {
          name: 'VacuumPower',
          type: 'Switch',
          metadata: { ga: { value: 'vacuumPower' } }
        }
      ]
    };
    const traits = Device.getTraits(item);
    expect(traits).toEqual(['action.devices.traits.StartStop']);
  });
});

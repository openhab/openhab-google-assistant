const Device = require('../../functions/devices/default.js');
const packageVersion = require('../../package.json').version;

describe('Default Device', () => {
  const item = {
    type: 'Number',
    state: '50',
    name: 'DefaultDevice',
    label: 'Default Device',
    metadata: {
      ga: {
        value: '',
        config: {
          inverted: true,
          ackNeeded: true,
          pinNeeded: '1234'
        }
      },
      synonyms: {
        value: 'Standard Device'
      }
    }
  };

  test('matchesItemType', () => {
    expect(Device.matchesItemType({ type: 'Number' })).toBe(true);
  });

  test('getConfig', () => {
    expect(Device.getConfig(item)).toStrictEqual({
      ackNeeded: true,
      inverted: true,
      pinNeeded: '1234'
    });
  });

  test('getState', () => {
    expect(Device.getState(item)).toStrictEqual({});
  });

  test('getMetadata', () => {
    expect(Device.getMetadata(item)).toStrictEqual({
      attributes: {},
      customData: {
        ackNeeded: true,
        deviceType: 'DefaultDevice',
        inverted: true,
        itemType: 'Number',
        pinNeeded: '1234'
      },
      deviceInfo: {
        manufacturer: 'openHAB',
        model: 'Number:DefaultDevice',
        hwVersion: '3.0.0',
        swVersion: packageVersion
      },
      id: 'DefaultDevice',
      name: {
        defaultNames: ['Default Device'],
        name: 'Default Device',
        nicknames: ['Default Device', 'Standard Device']
      },
      roomHint: undefined,
      structureHint: undefined,
      traits: [],
      type: '',
      willReportState: false
    });
  });

  test('getMetadata legacy', () => {
    const metadata = Device.getMetadata({
      metadata: {
        ga: {
          config: {
            tfaAck: true,
            tfaPin: '1234'
          }
        }
      }
    });
    expect(metadata.customData.ackNeeded).toBe(true);
    expect(metadata.customData.pinNeeded).toBe('1234');
  });

  test('getMetadata no label fallback', () => {
    const metadata = Device.getMetadata({
      type: 'Number',
      state: '50',
      name: 'DefaultDevice'
    });
    expect(metadata.name.name).toBe('DefaultDevice');
  });

  test('hasTag', () => {
    expect(Device.hasTag({}, 'testtag')).toBe(false);
    expect(Device.hasTag({ tags: ['test'] }, 'testtag')).toBe(false);
    expect(Device.hasTag({ tags: ['testtag'] }, 'testtag')).toBe(true);
    expect(Device.hasTag({ tags: ['TestTag'] }, 'testtag')).toBe(true);
  });
});

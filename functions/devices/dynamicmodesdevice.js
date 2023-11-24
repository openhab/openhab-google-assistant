const DefaultDevice = require('./default.js');

class DynamicModesDevice extends DefaultDevice {
  static getTraits() {
    return ['action.devices.traits.Modes'];
  }

  static get requiredItemTypes() {
    return ['Group'];
  }

  static matchesDeviceType(item) {
    return super.matchesDeviceType(item) && !!this.getAttributes(item).availableModes;
  }

  static getAttributes(item) {
    const config = this.getConfig(item);
    const members = this.getMembers(item);
    if (!config.mode || !('modesSettings' in members) || !members.modesSettings.state.includes('=')) {
      return {};
    }
    const modeNames = config.mode.split(',').map((s) => s.trim());
    const attributes = {
      availableModes: [
        {
          name: modeNames[0],
          name_values: [
            {
              name_synonym: modeNames,
              lang: config.lang || 'en'
            }
          ],
          settings: [],
          ordered: config.ordered === true
        }
      ]
    };
    members.modesSettings.state.split(',').forEach((setting) => {
      try {
        const [settingName, settingSynonyms] = setting
          .trim()
          .split('=')
          .map((s) => s.trim());
        attributes.availableModes[0].settings.push({
          setting_name: settingName,
          setting_values: [
            {
              setting_synonym: [settingName].concat(settingSynonyms.split(':').map((s) => s.trim())),
              lang: config.lang || 'en'
            }
          ]
        });
      } catch {}
    });
    return attributes;
  }

  static getState(item) {
    const config = this.getConfig(item);
    const members = this.getMembers(item);
    const state = {};
    if (config.mode && 'modesCurrentMode' in members) {
      const modeNames = config.mode.split(',').map((s) => s.trim());
      state.currentModeSettings = {
        [modeNames[0]]: members.modesCurrentMode.state
      };
    }
    return state;
  }

  static get supportedMembers() {
    return [
      { name: 'modesCurrentMode', types: ['String', 'Number'] },
      { name: 'modesSettings', types: ['String'] }
    ];
  }
}

module.exports = DynamicModesDevice;

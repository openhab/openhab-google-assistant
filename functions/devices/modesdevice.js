const DefaultDevice = require('./default.js');

class ModesDevice extends DefaultDevice {
  static getTraits() {
    return ['action.devices.traits.Modes'];
  }

  static matchesDeviceType(item) {
    return super.matchesDeviceType(item) && !!this.getAttributes(item).availableModes;
  }

  static getAttributes(item) {
    const config = this.getConfig(item);
    if (!config.mode || !config.settings) {
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
    config.settings.split(',').forEach((setting) => {
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

  static get requiredItemTypes() {
    return ['Color', 'Dimmer', 'Number', 'Player', 'Rollershutter', 'String', 'Switch'];
  }

  static getState(item) {
    const config = this.getConfig(item);
    const state = {};
    if (config.mode && config.settings) {
      const modeNames = config.mode.split(',').map((s) => s.trim());
      state.currentModeSettings = {
        [modeNames[0]]: item.state
      };
    }
    return state;
  }
}

module.exports = ModesDevice;

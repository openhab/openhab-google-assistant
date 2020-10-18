const DefaultDevice = require('./default.js');

class ModeLight extends DefaultDevice {
  static get type() {
    return 'action.devices.types.LIGHT';
  }

  static getTraits() {
    return [
      'action.devices.traits.Modes'
    ];
  }

  static getAttributes(item) {
    const attributes = {};
    const config = this.getConfig(item);
    if (config.modes && config.modes.name) {
      attributes.availableModes = [{
        name: config.modes.name,
        name_values: [{
          name_synonym: [config.modes.name].concat(config.modes.synonyms ? config.modes.synonyms.split(',').map(s => s.trim()) : []),
          lang: config.lang || 'en'
        }],
        settings: Object.keys(config.modes.settings || {}).map(setting_name => ({
          setting_name: setting_name,
          setting_values: [{
            setting_synonym: [setting_name].concat(config.modes.settings[setting_name].split(',').map(s => s.trim())),
            lang: config.lang || 'en'
          }]
        })),
        ordered: true
      }];
    }
    return attributes;
  }

  static get requiredItemTypes() {
    return ['String'];
  }

  static getState(item) {
    const config = this.getConfig(item);
    const state = {};
    if (config.modes && config.modes.name) {
      state.currentModeSettings = {
        [config.modes.name]: item.state
      };
    }
    return state;
  }
}

module.exports = ModeLight;

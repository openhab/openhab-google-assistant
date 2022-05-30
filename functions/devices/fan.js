const DefaultDevice = require('./default.js');

class Fan extends DefaultDevice {
  static get type() {
    return 'action.devices.types.FAN';
  }

  static getTraits() {
    return ['action.devices.traits.OnOff', 'action.devices.traits.FanSpeed'];
  }

  static getAttributes(item) {
    const attributes = {
      supportsFanSpeedPercent: true
    };

    const config = this.getConfig(item);
    if ('speeds' in config) {
      attributes.availableFanSpeeds = {
        speeds: [],
        ordered: config.ordered === true
      };
      config.speeds.split(',').forEach((speedEntry) => {
        try {
          const [speedName, speedSynonyms] = speedEntry
            .trim()
            .split('=')
            .map((s) => s.trim());
          attributes.availableFanSpeeds.speeds.push({
            speed_name: speedName,
            speed_values: [
              {
                speed_synonym: speedSynonyms.split(':').map((s) => s.trim()),
                lang: config.lang || 'en'
              }
            ]
          });
        } catch (error) {
          //
        }
      });
    }

    return attributes;
  }

  static get requiredItemTypes() {
    return ['Dimmer', 'Number'];
  }

  static getState(item) {
    const state = {
      on: Number(item.state) > 0,
      currentFanSpeedPercent: Number(item.state)
    };
    if ('speeds' in this.getConfig(item)) {
      state.currentFanSpeedSetting = item.state.toString();
    }
    return state;
  }
}

module.exports = Fan;

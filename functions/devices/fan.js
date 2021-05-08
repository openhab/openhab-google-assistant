const DefaultDevice = require('./default.js');

class Fan extends DefaultDevice {
  static get type() {
    return 'action.devices.types.FAN';
  }

  static getTraits() {
    return ['action.devices.traits.OnOff', 'action.devices.traits.FanSpeed'];
  }

  static getAttributes(item) {
    const config = this.getConfig(item);
    if (!config || !config.speeds) {
      return {};
    }
    const attributes = {
      availableFanSpeeds: {
        speeds: [],
        ordered: config.ordered === true
      },
      reversible: false
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
    return attributes;
  }

  static get requiredItemTypes() {
    return ['Dimmer'];
  }

  static getState(item) {
    return {
      currentFanSpeedSetting: item.state.toString(),
      on: Number(item.state) > 0
    };
  }
}

module.exports = Fan;

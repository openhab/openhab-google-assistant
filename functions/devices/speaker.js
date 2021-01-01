const DefaultDevice = require('./default.js');

class Speaker extends DefaultDevice {
  static get type() {
    return 'action.devices.types.SPEAKER';
  }

  static getTraits() {
    return [
      'action.devices.traits.Volume'
    ];
  }

  static getAttributes(item) {
    const config = this.getConfig(item);
    const attributes = {
      volumeMaxLevel: 100,
      volumeCanMuteAndUnmute: false
    };
    if ('volumeDefaultPercentage' in config) {
      attributes.volumeDefaultPercentage = Number(config.volumeDefaultPercentage);
    }
    if ('levelStepSize' in config) {
      attributes.levelStepSize = Number(config.levelStepSize);
    }
    return attributes;
  }

  static get requiredItemTypes() {
    return ['Dimmer'];
  }

  static getState(item) {
    return {
      currentVolume: Number(item.state) || 0
    };
  }
}

module.exports = Speaker;

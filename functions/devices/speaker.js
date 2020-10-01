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

  static get requiredItemTypes() {
    return ['Dimmer'];
  }

  static getState(item) {
    const volume = Number(item.state) || 0;
    return {
      currentVolume: volume,
      isMuted: volume === 0
    };
  }
}

module.exports = Speaker;

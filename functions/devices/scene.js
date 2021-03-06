const DefaultDevice = require('./default.js');

class Scene extends DefaultDevice {
  static get type() {
    return 'action.devices.types.SCENE';
  }

  static getTraits() {
    return ['action.devices.traits.Scene'];
  }

  static get requiredItemTypes() {
    return ['Switch'];
  }

  static getAttributes(item) {
    const config = this.getConfig(item);
    return {
      sceneReversible: config.sceneReversible !== false
    };
  }
}

module.exports = Scene;

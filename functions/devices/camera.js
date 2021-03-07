const DefaultDevice = require('./default.js');

class Camera extends DefaultDevice {
  static get type() {
    return 'action.devices.types.CAMERA';
  }

  static getTraits() {
    return ['action.devices.traits.CameraStream'];
  }

  static getAttributes(item) {
    const config = this.getConfig(item);
    return {
      cameraStreamSupportedProtocols: (config.protocols || 'hls,dash,smooth_stream,progressive_mp4')
        .split(',')
        .map((s) => s.trim()),
      cameraStreamNeedAuthToken: config.token ? true : false,
      cameraStreamNeedDrmEncryption: false
    };
  }

  static get requiredItemTypes() {
    return ['String'];
  }
}

module.exports = Camera;

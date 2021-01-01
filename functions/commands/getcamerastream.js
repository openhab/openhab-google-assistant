const DefaultCommand = require('./default.js');

class GetCameraStream extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.GetCameraStream';
  }

  static validateParams(params) {
    return ('StreamToChromecast' in params) && typeof params.StreamToChromecast === 'boolean' &&
      ('SupportedStreamProtocols' in params) && typeof params.SupportedStreamProtocols === 'object';
  }

  static requiresItem() {
    return true;
  }

  static convertParamsToValue() {
    return null;
  }

  static getResponseStates(_, item) {
    return {
      cameraStreamAccessUrl: item.state
    };
  }
}

module.exports = GetCameraStream;

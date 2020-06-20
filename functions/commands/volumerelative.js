const DefaultCommand = require('./default.js');

class VolumeRelative extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.volumeRelative';
  }

  static validateParams(params) {
    return ('volumeRelativeLevel' in params) && typeof params.volumeRelativeLevel === 'number';
  }

  static get requiresItem() {
    return true;
  }

  static convertParamsToValue(params, item) {
    let level = parseInt(item.state) + params.volumeRelativeLevel;
    return (level < 0 ? 0 : level > 100 ? 100 : level).toString();
  }

  static getResponseStates(params, item) {
    const state = parseInt(this.convertParamsToValue(params, item));
    return {
      currentVolume: state,
      isMuted: state === 0
    };
  }
}

module.exports = VolumeRelative;

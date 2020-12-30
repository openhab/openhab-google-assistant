const DefaultCommand = require('./default.js');
const DynamicModesDevice = require('../devices/dynamicmodesdevice.js');

class SetModes extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.SetModes';
  }

  static validateParams(params) {
    return ('updateModeSettings' in params) && typeof params.updateModeSettings === 'object';
  }
  static requiresItem(device) {
    return !!device.customData && !!device.customData.deviceType && device.customData.deviceType.startsWith('DynamicModes');
  }

  static getItemName(item, device) {
    if (device.customData && !!device.customData.deviceType && device.customData.deviceType.startsWith('DynamicModes')) {
      const members = DynamicModesDevice.getMembers(item);
      if ('modesCurrentMode' in members) {
        return members.modesCurrentMode.name;
      }
      throw { statusCode: 400 };
    }
    return item.name;
  }

  static convertParamsToValue(params) {
    const mode = Object.keys(params.updateModeSettings)[0];
    return params.updateModeSettings[mode].toString();
  }

  static getResponseStates(params) {
    const mode = Object.keys(params.updateModeSettings)[0];
    return {
      currentModeSettings: {
        [mode]: params.updateModeSettings[mode]
      }
    };
  }
}

module.exports = SetModes;

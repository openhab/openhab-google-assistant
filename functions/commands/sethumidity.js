const DefaultCommand = require('./default.js');

class SetHumidity extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.SetHumidity';
  }

  static validateParams(params) {
    return 'humidity' in params && typeof params.humidity === 'number';
  }

  static requiresItem(device) {
    // Only require item if we need current state for response
    // For simple devices, we can work with just device metadata
    const deviceType = this.getDeviceType(device);
    const itemType = this.getItemType(device);

    // Group devices need item state for getResponseStates
    return deviceType === 'Humidifier' && itemType === 'Group';
  }

  static getItemName(device) {
    const deviceType = this.getDeviceType(device);
    const itemType = this.getItemType(device);

    if (deviceType === 'Humidifier' && itemType === 'Group') {
      const members = this.getMembers(device);
      if ('humidifierHumiditySetpoint' in members) {
        return members.humidifierHumiditySetpoint;
      }
      throw { statusCode: 400 };
    }

    // For simple humidifier devices (non-group)
    return device.id;
  }

  static convertParamsToValue(params, item, device) {
    // Get maxHumidity from device customData (pre-processed and efficient)
    const maxHumidity = (device.customData && device.customData.maxHumidity) ?? 100;

    // Convert percentage to device's expected range
    const value = (params.humidity * maxHumidity) / 100;
    return value.toString();
  }

  static getResponseStates(params, item, device) {
    const deviceType = this.getDeviceType(device);
    const itemType = this.getItemType(device);

    if (deviceType === 'Humidifier' && itemType === 'Group' && item) {
      // For Group devices, use current state from item
      const Humidifier = require('../devices/humidifier.js');
      const currentState = Humidifier.getState(item);
      const state = { ...currentState };
      state.humiditySetpointPercent = params.humidity;
      return state;
    } else {
      // For simple devices, return just the updated humidity
      return {
        humiditySetpointPercent: params.humidity,
        on: true // Assume device is on when setting humidity
      };
    }
  }

  static checkCurrentState(target, state, params) {
    const targetHumidity = parseFloat(target);
    const currentHumidity = parseFloat(state);

    // Allow small tolerance for humidity values
    if (Math.abs(targetHumidity - currentHumidity) < 1) {
      throw { errorCode: 'alreadyAtTarget', debugString: `Already at target humidity ${params.humidity}%` };
    }
  }
}

module.exports = SetHumidity;

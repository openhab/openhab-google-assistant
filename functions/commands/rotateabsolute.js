const DefaultCommand = require('./default.js');

class RotateAbsolute extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.RotateAbsolute';
  }

  static validateParams(params) {
    return (
      ('rotationPercent' in params && typeof params.rotationPercent === 'number') ||
      ('rotationDegrees' in params && typeof params.rotationDegrees === 'number')
    );
  }

  static getItemName(device) {
    const members = this.getMembers(device);
    // If device is a group with rotation member, use that
    if ('shutterRotation' in members) {
      return members.shutterRotation;
    }
    // Otherwise use the device itself (simple shutter case)
    return device.id;
  }

  static convertParamsToValue(params, device) {
    let targetValue;

    if ('rotationPercent' in params) {
      targetValue = params.rotationPercent;
    } else if ('rotationDegrees' in params) {
      // Convert degrees to percentage based on stored configuration
      const rotationConfig = (device.customData && device.customData.rotationConfig) || {};
      const rotationDegreesMin = rotationConfig.rotationDegreesMin || 0;
      const rotationDegreesMax = rotationConfig.rotationDegreesMax || 90;
      const degreeRange = rotationDegreesMax - rotationDegreesMin;
      const normalizedDegrees = Math.max(0, Math.min(degreeRange, params.rotationDegrees - rotationDegreesMin));
      targetValue = Math.round((normalizedDegrees / degreeRange) * 100);
    }

    // Handle inversion if device is inverted
    if (this.isInverted(device)) {
      targetValue = 100 - targetValue;
    }

    return targetValue.toString();
  }

  static getResponseStates(params, device) {
    const response = {};

    if ('rotationPercent' in params) {
      response.rotationPercent = params.rotationPercent;
    }

    if ('rotationDegrees' in params) {
      response.rotationDegrees = params.rotationDegrees;
    } else if ('rotationPercent' in params) {
      // Calculate degrees from percentage using stored configuration
      const rotationConfig = (device.customData && device.customData.rotationConfig) || {};
      const rotationDegreesMin = rotationConfig.rotationDegreesMin || 0;
      const rotationDegreesMax = rotationConfig.rotationDegreesMax || 90;
      const degreeRange = rotationDegreesMax - rotationDegreesMin;
      response.rotationDegrees = Math.round(rotationDegreesMin + (params.rotationPercent / 100) * degreeRange);
    }

    return response;
  }
}

module.exports = RotateAbsolute;

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
      const rotationDegreesMin = rotationConfig.rotationDegreesMin ?? 0;
      const rotationDegreesMax = rotationConfig.rotationDegreesMax ?? 90;
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

  static getResponseStates(params, _, device) {
    const response = {};
    const rotationConfig = device?.customData?.rotationConfig ?? {};
    const supportsDegrees = rotationConfig.supportsDegrees !== false;
    const rotationDegreesMin = rotationConfig.rotationDegreesMin ?? 0;
    const rotationDegreesMax = rotationConfig.rotationDegreesMax ?? 90;
    const degreeRange = rotationDegreesMax - rotationDegreesMin;

    // Always include rotationPercent and optionally rotationDegrees in response
    if ('rotationPercent' in params) {
      response.rotationPercent = params.rotationPercent;
      if (supportsDegrees) {
        response.rotationDegrees = Math.round(rotationDegreesMin + (params.rotationPercent / 100) * degreeRange);
      }
    } else {
      // rotationDegrees in params
      const normalizedDegrees = Math.max(0, Math.min(degreeRange, params.rotationDegrees - rotationDegreesMin));
      response.rotationPercent = Math.round((normalizedDegrees / degreeRange) * 100);
      response.rotationDegrees = params.rotationDegrees;
    }

    return response;
  }
}

module.exports = RotateAbsolute;

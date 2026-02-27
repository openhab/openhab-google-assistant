const DefaultCommand = require('./default.js');
const { ERROR_CODES, GoogleAssistantError } = require('../googleErrorCodes.js');

class RotateAbsolute extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.RotateAbsolute';
  }

  static validateParams(params) {
    // Validate that at least one rotation parameter exists and is a number
    const hasRotationPercent = 'rotationPercent' in params && typeof params.rotationPercent === 'number';
    const hasRotationDegrees = 'rotationDegrees' in params && typeof params.rotationDegrees === 'number';

    if (!hasRotationPercent && !hasRotationDegrees) {
      return false;
    }

    // Validate rotationPercent range (0-100)
    if (hasRotationPercent) {
      if (params.rotationPercent < 0 || params.rotationPercent > 100) {
        return false;
      }
    }

    // Validate rotationDegrees range (0-360)
    if (hasRotationDegrees) {
      if (params.rotationDegrees < 0 || params.rotationDegrees > 360) {
        return false;
      }
    }

    return true;
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

  static convertParamsToValue(params, _, device) {
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

  static checkCurrentState(target, state, params) {
    const targetRotation = parseInt(target);
    const currentRotation = parseInt(state);

    if (!isNaN(targetRotation) && !isNaN(currentRotation)) {
      if (Math.abs(targetRotation - currentRotation) < 1) {
        if ('rotationPercent' in params) {
          throw new GoogleAssistantError(
            ERROR_CODES.ALREADY_IN_STATE,
            `Rotation is already at ${params.rotationPercent}%`
          );
        } else {
          throw new GoogleAssistantError(
            ERROR_CODES.ALREADY_IN_STATE,
            `Rotation is already at ${params.rotationDegrees}°`
          );
        }
      }
    }
  }
}

module.exports = RotateAbsolute;

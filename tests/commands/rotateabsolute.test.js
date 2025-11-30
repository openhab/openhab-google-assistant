const Command = require('../../functions/commands/rotateabsolute.js');

describe('RotateAbsolute Command', () => {
  describe('validateParams', () => {
    test('validateParams rotationPercent', () => {
      expect(Command.validateParams({ rotationPercent: 50 })).toBe(true);
    });

    test('validateParams rotationDegrees', () => {
      expect(Command.validateParams({ rotationDegrees: 45 })).toBe(true);
    });

    test('validateParams both params', () => {
      expect(Command.validateParams({ rotationPercent: 50, rotationDegrees: 45 })).toBe(true);
    });

    test('validateParams invalid', () => {
      expect(Command.validateParams({})).toBe(false);
      expect(Command.validateParams({ rotationPercent: 'invalid' })).toBe(false);
      expect(Command.validateParams({ rotationDegrees: 'invalid' })).toBe(false);
      expect(Command.validateParams({ someOtherParam: 50 })).toBe(false);
    });
  });

  describe('getItemName', () => {
    test('getItemName group with shutterRotation member', () => {
      const device = {
        id: 'TestDevice',
        customData: {
          members: {
            shutterRotation: 'TestDevice_Rotation'
          }
        }
      };
      expect(Command.getItemName(device)).toBe('TestDevice_Rotation');
    });

    test('getItemName single device', () => {
      const device = {
        id: 'TestDevice',
        customData: {}
      };
      expect(Command.getItemName(device)).toBe('TestDevice');
    });
  });

  describe('convertParamsToValue', () => {
    test('convertParamsToValue rotationPercent', () => {
      const device = { customData: {} };
      expect(Command.convertParamsToValue({ rotationPercent: 50 }, null, device)).toBe('50');
    });

    test('convertParamsToValue rotationDegrees default range', () => {
      const device = { customData: {} };
      // Default range is 0-90 degrees, so 45 degrees = 50%
      expect(Command.convertParamsToValue({ rotationDegrees: 45 }, null, device)).toBe('50');
    });

    test('convertParamsToValue rotationDegrees custom range', () => {
      const device = {
        customData: {
          rotationConfig: {
            rotationDegreesMin: 0,
            rotationDegreesMax: 180
          }
        }
      };
      // Range is 0-180 degrees, so 90 degrees = 50%
      expect(Command.convertParamsToValue({ rotationDegrees: 90 }, null, device)).toBe('50');
    });

    test('convertParamsToValue inverted', () => {
      const device = { customData: { inverted: true } };
      expect(Command.convertParamsToValue({ rotationPercent: 30 }, null, device)).toBe('70');
    });

    test('convertParamsToValue degrees out of range', () => {
      const device = {
        customData: {
          rotationConfig: {
            rotationDegreesMin: 0,
            rotationDegreesMax: 90
          }
        }
      };
      // 120 degrees should be clamped to 90 degrees = 100%
      expect(Command.convertParamsToValue({ rotationDegrees: 120 }, null, device)).toBe('100');
      // -10 degrees should be clamped to 0 degrees = 0%
      expect(Command.convertParamsToValue({ rotationDegrees: -10 }, null, device)).toBe('0');
    });
  });

  describe('getResponseStates', () => {
    test('getResponseStates rotationPercent only', () => {
      const device = { customData: {} };
      const response = Command.getResponseStates({ rotationPercent: 50 }, null, device);
      expect(response.rotationPercent).toBe(50);
      expect(response.rotationDegrees).toBe(45); // 50% of default 0-90 range
    });

    test('getResponseStates rotationDegrees only', () => {
      const device = { customData: {} };
      const response = Command.getResponseStates({ rotationDegrees: 30 }, null, device);
      expect(response.rotationDegrees).toBe(30);
      expect(response.rotationPercent).toBe(33); // 30 degrees in 0-90 range = 33%
    });

    test('getResponseStates custom degree range', () => {
      const device = {
        customData: {
          rotationConfig: {
            rotationDegreesMin: 0,
            rotationDegreesMax: 180
          }
        }
      };
      const response = Command.getResponseStates({ rotationPercent: 50 }, null, device);
      expect(response.rotationPercent).toBe(50);
      expect(response.rotationDegrees).toBe(90); // 50% of 0-180 range
    });

    test('getResponseStates with supportsDegrees disabled - percent command', () => {
      const device = {
        customData: {
          rotationConfig: {
            supportsDegrees: false
          }
        }
      };
      const response = Command.getResponseStates({ rotationPercent: 50 }, null, device);
      expect(response.rotationPercent).toBe(50);
      expect(response.rotationDegrees).toBeUndefined(); // Degrees not included when disabled
    });

    test('getResponseStates with supportsDegrees disabled - degrees command', () => {
      const device = {
        customData: {
          rotationConfig: {
            supportsDegrees: false
          }
        }
      };
      // Even with supportsDegrees=false, if Google sends degrees, we still respond with degrees
      const response = Command.getResponseStates({ rotationDegrees: 45 }, null, device);
      expect(response.rotationPercent).toBe(50); // Calculated from degrees
      expect(response.rotationDegrees).toBe(45); // Echo back what Google sent
    });
  });
});

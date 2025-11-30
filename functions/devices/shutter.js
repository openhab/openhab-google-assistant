const OpenCloseDevice = require('./openclosedevice.js');

class Shutter extends OpenCloseDevice {
  static get type() {
    return 'action.devices.types.SHUTTER';
  }

  static getTraits(item) {
    const traits = super.getTraits(item);
    const members = this.getMembers(item);
    const itemType = item.groupType || item.type;

    // Add rotation trait only for group items with shutterRotation member
    if (itemType === 'Group' && 'shutterRotation' in members) {
      traits.push('action.devices.traits.Rotation');
    }

    return traits;
  }

  static get requiredItemTypes() {
    return ['Rollershutter', 'Switch', 'Contact', 'Group'];
  }

  static matchesDeviceType(item) {
    const itemType = item.groupType || item.type;
    return super.matchesDeviceType(item) && (itemType !== 'Group' || Object.keys(this.getMembers(item)).length > 0);
  }

  static getAttributes(item) {
    const attributes = super.getAttributes(item);
    const config = this.getConfig(item);

    // Add rotation attributes only for group items with rotation trait
    if (this.getTraits(item).includes('action.devices.traits.Rotation')) {
      // Required attributes
      attributes.supportsDegrees = config.supportsDegrees !== false; // Default to true
      attributes.supportsPercent = true; // Always support percent (openHAB uses percentages)

      // Optional attribute - only include when true
      if (config.supportsContinuousRotation === true) {
        attributes.supportsContinuousRotation = true;
      }

      // Rotation degree range - required when supportsDegrees is true
      if (attributes.supportsDegrees) {
        const [min, max] = (config.rotationDegreesRange || '0,90').split(',').map((s) => parseInt(s.trim()));
        if (!isNaN(min) && !isNaN(max)) {
          attributes.rotationDegreesRange = {
            rotationDegreesMin: min,
            rotationDegreesMax: max
          };
        }
      }
    }

    return attributes;
  }

  static getMetadata(item) {
    const metadata = super.getMetadata(item);
    const members = this.getMembers(item);

    // Store shutterPosition item type for command handling
    if ('shutterPosition' in members) {
      metadata.customData.shutterPositionItemType = members.shutterPosition.type;
    }

    // Store only rotation configuration needed by commands in customData
    if (this.getTraits(item).includes('action.devices.traits.Rotation')) {
      const attributes = this.getAttributes(item);
      metadata.customData.rotationConfig = { supportsDegrees: attributes.supportsDegrees };
      // Only store degree range if degrees are supported
      if (attributes.supportsDegrees && attributes.rotationDegreesRange) {
        metadata.customData.rotationConfig.rotationDegreesMin = attributes.rotationDegreesRange.rotationDegreesMin;
        metadata.customData.rotationConfig.rotationDegreesMax = attributes.rotationDegreesRange.rotationDegreesMax;
      }
    }

    return metadata;
  }

  static getState(item) {
    const state = {};
    const config = this.getConfig(item);
    const members = this.getMembers(item);
    const itemType = item.groupType || item.type;

    // Handle OpenClose state
    if (itemType === 'Group' && 'shutterPosition' in members) {
      // Use shutterPosition member for groups
      const positionState = parseFloat(members.shutterPosition.state);
      const normalizedState = isNaN(positionState) ? 0 : Math.round(positionState);
      state.openPercent = config.inverted !== true ? 100 - normalizedState : normalizedState;
    } else {
      // Use parent class logic for single items
      const parentState = super.getState(item);
      state.openPercent = parentState.openPercent;
    }

    // Add rotation state only for group items with shutterRotation member
    if (itemType === 'Group' && 'shutterRotation' in members) {
      // Get rotation from group member
      const rotationState = parseFloat(members.shutterRotation.state);
      let rotationPercent = isNaN(rotationState) ? 0 : Math.round(rotationState);

      // Handle inversion
      if (config.inverted === true) {
        rotationPercent = 100 - rotationPercent;
      }

      // Always include rotationPercent (required when supportsPercent is true)
      state.rotationPercent = Math.max(0, Math.min(100, rotationPercent));

      // Include rotationDegrees only when supportsDegrees is enabled
      if (config.supportsDegrees !== false) {
        const attributes = this.getAttributes(item);
        if (attributes.rotationDegreesRange) {
          const degreeRange =
            attributes.rotationDegreesRange.rotationDegreesMax - attributes.rotationDegreesRange.rotationDegreesMin;
          state.rotationDegrees = Math.round(
            attributes.rotationDegreesRange.rotationDegreesMin + (state.rotationPercent / 100) * degreeRange
          );
        }
      }
    }

    return state;
  }

  static get supportedMembers() {
    return [
      { name: 'shutterPosition', types: ['Rollershutter', 'Dimmer', 'Number'] },
      { name: 'shutterRotation', types: ['Rollershutter', 'Dimmer', 'Number'] }
    ];
  }
}

module.exports = Shutter;

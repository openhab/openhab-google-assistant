/* eslint-disable no-unused-vars */
const packageVersion = require('../../package.json').version;

class DefaultDevice {
  static get type() {
    return '';
  }

  /**
   * @param {object} item
   */
  static getTraits(item) {
    return [];
  }

  static get requiredItemTypes() {
    return [];
  }

  /**
   * @param {object} item
   */
  static isCompatible(item) {
    return (
      item.metadata &&
      item.metadata.ga &&
      this.type.toLowerCase() === `action.devices.types.${item.metadata.ga.value}`.toLowerCase()
    );
  }

  /**
   * @param {object} item
   */
  static matchesItemType(item) {
    return (
      !this.requiredItemTypes.length ||
      this.requiredItemTypes.includes((item.groupType || item.type || '').split(':')[0])
    );
  }

  /**
   * @param {object} item
   */
  static getAttributes(item) {
    return {};
  }

  /**
   * @param {object} item
   */
  static getConfig(item) {
    return (item && item.metadata && item.metadata.ga && item.metadata.ga.config) || {};
  }

  /**
   * @param {object} item
   */
  static getMetadata(item) {
    const config = this.getConfig(item);
    const itemType = item.groupType || item.type;
    const deviceName = config.name || item.label || item.name;
    const metadata = {
      id: item.name,
      type: this.type,
      traits: this.getTraits(item),
      name: {
        name: deviceName,
        defaultNames: [deviceName],
        nicknames: [
          deviceName,
          ...(item.metadata && item.metadata.synonyms
            ? item.metadata.synonyms.value.split(',').map((s) => s.trim())
            : [])
        ]
      },
      willReportState: false,
      roomHint: config.roomHint,
      structureHint: config.structureHint,
      deviceInfo: {
        manufacturer: 'openHAB',
        model: `${itemType}:${item.name}`,
        hwVersion: '3.0.0',
        swVersion: packageVersion
      },
      attributes: this.getAttributes(item),
      customData: {
        deviceType: this.name,
        itemType: itemType
      }
    };
    if (config.inverted === true) {
      metadata.customData.inverted = true;
    }
    if (config.ackNeeded === true || config.tfaAck === true) {
      metadata.customData.ackNeeded = true;
    }
    if (typeof config.pinNeeded === 'string' || typeof config.tfaPin === 'string') {
      metadata.customData.pinNeeded = config.pinNeeded || config.tfaPin;
    }
    return metadata;
  }

  /**
   * @param {object} item
   */
  static getState(item) {
    return {};
  }
}

module.exports = DefaultDevice;

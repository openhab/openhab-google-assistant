/* eslint-disable no-unused-vars */
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
    return item.metadata && item.metadata.ga &&
      this.type.toLowerCase() === `action.devices.types.${item.metadata.ga.value}`.toLowerCase() ||
      this.hasTag(item, this.type.substr(21).replace('SWITCH', 'SWITCHABLE').replace('LIGHT', 'LIGHTING'))
  }

  /**
   * @param {object} item
   */
  static matchesItemType(item) {
    return (
      !this.requiredItemTypes.length ||
      this.requiredItemTypes.includes(item.type) ||
      (item.type === 'Group' && item.groupType && this.requiredItemTypes.includes(item.groupType))
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
    return item && item.metadata && item.metadata.ga && item.metadata.ga.config || {};
  }

  /**
   * @param {object} item
   */
  static getMetadata(item) {
    const config = this.getConfig(item);
    const itemType = item.type === 'Group' && item.groupType ? item.groupType : item.type;
    const metadata = {
      id: item.name,
      type: this.type,
      traits: this.getTraits(item),
      name: {
        name: config.name || item.label,
        defaultNames: [config.name || item.label],
        nicknames: [config.name || item.label, ...(item.metadata && item.metadata.synonyms ? item.metadata.synonyms.value.split(',').map(s => s.trim()) : [])]
      },
      willReportState: false,
      roomHint: config.roomHint,
      structureHint: config.structureHint,
      deviceInfo: {
        manufacturer: 'openHAB',
        model: `${itemType}:${item.name}`,
        hwVersion: '2.5.0',
        swVersion: '2.5.0'
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
    if (config.ackNeeded === true) {
      metadata.customData.ackNeeded = true;
    }
    if (typeof (config.pinNeeded) === 'string') {
      metadata.customData.pinNeeded = config.pinNeeded;
    }
    return metadata;
  }

  /**
   * @param {object} item
   */
  static getState(item) {
    return {};
  }

  /**
   * @param {object} item
   * @param {string} tag
   */
  static hasTag(item, tag) {
    return item.tags && item.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase()) || false;
  }
}

module.exports = DefaultDevice;

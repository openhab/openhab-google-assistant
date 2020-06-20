class DefaultDevice {
  static get type() {
    return '';
  }

  static get traits() {
    return [];
  }

  static getAttributes(item = {}) {
    return {};
  }

  static getConfig(item = {}) {
    return item && item.metadata && item.metadata.ga && item.metadata.ga.config || {};
  }

  static getMetadata(item = {}) {
    const config = this.getConfig(item);
    const itemType = item.type === 'Group' && item.groupType ? item.groupType : item.type;
    const metadata = {
      id: item.name,
      type: this.type,
      traits: this.traits,
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

  static get requiredItemTypes() {
    return [];
  }

  static checkItemType(item = {}) {
    return (
      !this.requiredItemTypes.length ||
      this.requiredItemTypes.includes(item.type) ||
      (item.type === 'Group' && item.groupType && this.requiredItemTypes.includes(item.groupType))
    );
  }

  static getState(item = {}) {
    return {};
  }
}

module.exports = DefaultDevice;

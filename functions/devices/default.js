/* eslint-disable no-unused-vars */
const packageVersion = require('../package.json').version;

class DefaultDevice {
  static get type() {
    return '';
  }

  /**
   * @param {object} item
   * @returns {Array<string>}
   */
  static getTraits(item) {
    return [];
  }

  /**
   * @returns {Array<string>}
   */
  static get requiredItemTypes() {
    return [];
  }

  /**
   * @param {object} item
   * @returns {boolean}
   */
  static matchesDeviceType(item) {
    return !!(
      item.metadata?.ga && this.type.toLowerCase() === `action.devices.types.${item.metadata.ga.value}`.toLowerCase()
    );
  }

  /**
   * @param {object} item
   */
  static matchesItemType(item) {
    return !!(
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
    return item?.metadata?.ga?.config || {};
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
          ...(item.metadata?.synonyms ? item.metadata.synonyms.value.split(',').map((s) => s.trim()) : [])
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
    if (!!config.inverted === true) {
      metadata.customData.inverted = true;
    }
    if (!!config.checkState === true) {
      metadata.customData.checkState = true;
    }
    if (!!config.ackNeeded === true || !!config.tfaAck === true) {
      metadata.customData.ackNeeded = true;
    }
    if (typeof config.pinNeeded === 'string' || typeof config.tfaPin === 'string') {
      metadata.customData.pinNeeded = config.pinNeeded || config.tfaPin;
      if (config.pinOnDisarmOnly === true) {
        metadata.customData.pinOnDisarmOnly = true;
      }
    }
    if (config.waitForStateChange) {
      metadata.customData.waitForStateChange = parseInt(config.waitForStateChange);
    }
    if (this.supportedMembers.length) {
      const members = this.getMembers(item);
      metadata.customData.members = {};
      for (const member in members) {
        metadata.customData.members[member] = members[member].name;
      }
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
   * @returns {Array<object>}
   */
  static get supportedMembers() {
    return [];
  }

  /**
   * Gets supported members from an openHAB group item
   * @param {object} item - The openHAB item with potential members
   * @returns {object} Mapped members with their names and states
   */
  static getMembers(item) {
    const supportedMembers = this.supportedMembers;
    const members = {};
    // Early return if no members or supportedMembers
    if (!item.members?.length || !supportedMembers.length) {
      return members;
    }
    item.members.forEach((member) => {
      // Skip members without Google Assistant metadata
      if (!member.metadata?.ga?.value) {
        return;
      }
      const memberType = (member.groupType || member.type || '').split(':')[0];
      const gaValue = member.metadata.ga.value.toLowerCase();
      // Find matching supported member by type and name
      const matchedType = supportedMembers.find(
        (supportedMember) =>
          supportedMember.types.includes(memberType) && supportedMember.name.toLowerCase() === gaValue
      );
      if (matchedType) {
        members[matchedType.name] = {
          name: member.name,
          state: member.state
        };
      }
    });
    return members;
  }
}

module.exports = DefaultDevice;

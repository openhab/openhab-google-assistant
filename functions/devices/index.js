const { DEVICE_REGISTRY } = require('./registry.js');

module.exports = {
  /**
   * Find the appropriate device type for an openHAB item.
   *
   * @param {object} item - The openHAB item with metadata
   * @returns {class|undefined} The matching device class, or undefined if no match
   */
  getDeviceForItem: (item) => {
    return (
      item.metadata &&
      item.metadata.ga &&
      DEVICE_REGISTRY.find((device) => device.matchesItemType(item) && device.matchesDeviceType(item))
    );
  }
};

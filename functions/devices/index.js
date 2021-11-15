const glob = require('glob');

const Devices = [];

glob.sync('./!(index).js', { cwd: __dirname }).forEach((file) => {
  const device = require(file);
  if (device.type) {
    Devices.push(device);
  }
});

module.exports = {
  /**
   * @param {object} item
   */
  getDeviceForItem: (item) => {
    return (
      item.metadata &&
      item.metadata.ga &&
      Devices.find((device) => device.matchesItemType(item) && device.isCompatible(item))
    );
  }
};

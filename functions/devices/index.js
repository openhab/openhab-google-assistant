const fs = require('fs');

const Devices = [];

fs.readdirSync(__dirname).forEach(file => {
  if (file === 'index.js' || !file.endsWith('.js')) return;
  const device = require(`./${file}`);
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

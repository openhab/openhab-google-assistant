const DefaultDevice = require('./default.js');

class OpenCloseDevice extends DefaultDevice {
  static getTraits() {
    return ['action.devices.traits.OpenClose', 'action.devices.traits.StartStop'];
  }

  static getAttributes(item) {
    const attributes = {
      pausable: false,
      discreteOnlyOpenClose: this.getConfig(item).discreteOnly === true,
      queryOnlyOpenClose: this.getConfig(item).queryOnly === true
    };
    const itemType = item.groupType || item.type;
    if (itemType === 'Switch') {
      attributes.discreteOnlyOpenClose = true;
    }
    if (itemType === 'Contact') {
      attributes.discreteOnlyOpenClose = true;
      attributes.queryOnlyOpenClose = true;
    }
    return attributes;
  }

  static get requiredItemTypes() {
    return ['Rollershutter', 'Switch', 'Contact'];
  }

  static getState(item) {
    let state = 0;
    const itemType = item.groupType || item.type;
    if (itemType === 'Rollershutter') {
      state = Number(item.state);
    } else {
      state = item.state === 'ON' || item.state === 'OPEN' ? 0 : 100;
    }
    return {
      openPercent: this.getConfig(item).inverted !== true ? 100 - state : state
    };
  }
}

module.exports = OpenCloseDevice;

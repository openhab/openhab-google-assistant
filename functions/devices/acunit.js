const DefaultDevice = require('./default.js');
const Fan = require('./fan');
const Thermostat = require('./thermostat');

class ACUnit extends DefaultDevice {
  static get type() {
    return 'action.devices.types.AC_UNIT';
  }

  static getTraits(item) {
    return [...Fan.getTraits(item), ...Thermostat.getTraits()];
  }

  static get requiredItemTypes() {
    return ['Group'];
  }

  static matchesDeviceType(item) {
    return super.matchesDeviceType(item) && Object.keys(this.getMembers(item)).length > 0;
  }

  static getAttributes(item) {
    return {
      ...Fan.getAttributes(item),
      ...Thermostat.getAttributes(item)
    };
  }

  static getState(item) {
    return {
      ...Fan.getState(item),
      ...Thermostat.getState(item)
    };
  }

  static get supportedMembers() {
    return [...Fan.supportedMembers, ...Thermostat.supportedMembers];
  }
}

module.exports = ACUnit;

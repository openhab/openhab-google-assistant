const DefaultDevice = require('./default.js');

class Sensor extends DefaultDevice {
  static get type() {
    return 'action.devices.types.SENSOR';
  }

  static getTraits() {
    return ['action.devices.traits.SensorState'];
  }

  static get requiredItemTypes() {
    return ['Number', 'String', 'Dimmer', 'Switch', 'Rollershutter', 'Contact'];
  }

  static matchesDeviceType(item) {
    return super.matchesDeviceType(item) && !!this.getAttributes(item).sensorStatesSupported;
  }

  static getAttributes(item) {
    const config = this.getConfig(item);
    if (!('sensorName' in config) || (!('valueUnit' in config) && !('states' in config))) return {};
    const attributes = { sensorStatesSupported: [{ name: config.sensorName }] };
    if ('valueUnit' in config) {
      attributes.sensorStatesSupported[0].numericCapabilities = {
        rawValueUnit: config.valueUnit
      };
    }
    if ('states' in config) {
      attributes.sensorStatesSupported[0].descriptiveCapabilities = {
        availableStates: config.states.split(',').map((s) => s.trim().split('=')[0].trim())
      };
    }
    return attributes;
  }

  static getState(item) {
    const config = this.getConfig(item);
    const state = {
      currentSensorStateData: [
        {
          name: config.sensorName,
          currentSensorState: this.translateStateToGoogle(item)
        }
      ]
    };
    const rawValue = parseFloat(item.state);
    if (!isNaN(rawValue)) state.currentSensorStateData[0].rawValue = rawValue;
    return state;
  }

  static translateStateToGoogle(item) {
    const config = this.getConfig(item);
    if ('states' in config) {
      const states = config.states.split(',').map((s) => s.trim());
      for (const state of states) {
        const [key, value] = state.split('=').map((s) => s.trim());
        if (value === item.state || value === parseFloat(item.state).toFixed(0)) {
          return key;
        }
      }
    }
    return '';
  }
}

module.exports = Sensor;

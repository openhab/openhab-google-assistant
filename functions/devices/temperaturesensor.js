const DefaultDevice = require('./default.js');

class TemperatureSensor extends DefaultDevice {
  static get type() {
    return 'action.devices.types.SENSOR';
  }

  static get traits() {
    return [
      'action.devices.traits.TemperatureControl'
    ];
  }

  static getAttributes(item) {
    return {
      queryOnlyTemperatureControl: true,
      temperatureUnitForUX: this.getConfig(item).useFahrenheit === true ? 'F' : 'C'
    };
  }

  static getState(item) {
    var state = Number(parseFloat(item.state).toFixed(1));
    if (this.getConfig(item).useFahrenheit === true) {
      state = this.convertToCelsius(state);
    }
    return {
      temperatureAmbientCelsius: state,
    };
  }

  static convertToCelsius(value = 0) {
    return Number(((value - 32) * 5 / 9).toFixed(1));
  }
}

module.exports = TemperatureSensor;

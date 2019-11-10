/**
 * Copyright (c) 2010-2019 Contributors to the openHAB project
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Device definitions for translating between Google Action Devices to openHAB Items
 *
 * @author Michael Krug
 *
 */
const getDeviceForItem = (item) => {
  return Devices.find((device) => (
    item.metadata && item.metadata.ga &&
    device.type.toLowerCase() === `action.devices.types.${item.metadata.ga.value}`.toLowerCase() &&
    device.checkItemType(item)
  ));
};

class GenericDevice {
  static get type() {
    return '';
  }

  static get traits() {
    return [];
  }

  static getAttributes(item = {}) {
    return {};
  }

  static getMetadata(item = {}) {
    const customData = {
      itemType: item.type
    };
    if (item.metadata.ga.config && item.metadata.ga.config.tfaAck) {
      customData.tfaAck = item.metadata.ga.config.tfaAck;
    }
    if (item.metadata.ga.config && item.metadata.ga.config.tfaPin) {
      customData.tfaPin = item.metadata.ga.config.tfaPin;
    }
    return {
      id: item.name,
      type: this.type,
      traits: this.traits,
      name: {
        name: item.name,
        nicknames: [],
        defaultNames: [item.name]
      },
      willReportState: false,
      roomHint: '',
      structureHint: '',
      deviceInfo: {
        manufacturer: 'openHAB',
        model: item.type,
        hwVersion: '2.4.0',
        swVersion: '2.4.0'
      },
      attributes: this.getAttributes(item),
      customData: customData
    };
  }

  static get requiredItemType() {
    return '';
  }

  static checkItemType(item = {}) {
    return (
      !this.requiredItemType ||
      item.type === this.requiredItemType ||
      (item.type === 'Group' && item.groupType && item.groupType === this.requiredItemType)
    );
  }

  static getState(item = {}) {
    return {};
  }
}

/* Switch items that act as switch devices */

class Switch extends GenericDevice {
  static get type() {
    return 'action.devices.types.SWITCH';
  }

  static get traits() {
    return [
      'action.devices.traits.OnOff'
    ];
  }

  static get requiredItemType() {
    return 'Switch';
  }

  static getState(item) {
    return {
      on: item.state === 'ON'
    };
  }
}

class Outlet extends Switch {
  static get type() {
    return 'action.devices.types.OUTLET';
  }
}

class Fan extends Switch {
  static get type() {
    return 'action.devices.types.FAN';
  }
}

class CoffeeMaker extends Switch {
  static get type() {
    return 'action.devices.types.COFFEE_MAKER';
  }
}

class WaterHeater extends Switch {
  static get type() {
    return 'action.devices.types.WATERHEATER';
  }
}

class Fireplace extends Switch {
  static get type() {
    return 'action.devices.types.FIREPLACE';
  }
}

/* Switch items that act as open-close devices */

class Valve extends GenericDevice {
  static get type() {
    return 'action.devices.types.VALVE';
  }

  static get traits() {
    return [
      'action.devices.traits.OpenClose'
    ];
  }

  static get requiredItemType() {
    return 'Switch';
  }

  static getState(item) {
    return {
      openPercent: item.state === 'ON' ? 100 : 0
    };
  }
}

/* Switch items that act as start-stop devices */

class StartStopSwitch extends GenericDevice {
  static get traits() {
    return [
      'action.devices.traits.StartStop'
    ];
  }

  static get requiredItemType() {
    return 'Switch';
  }

  static getState(item) {
    return {
      isRunning: item.state === 'ON',
      isPaused: item.state !== 'ON'
    };
  }
}

class Sprinkler extends StartStopSwitch {
  static get type() {
    return 'action.devices.types.SPRINKLER';
  }
}

class Vacuum extends StartStopSwitch {
  static get type() {
    return 'action.devices.types.VACUUM';
  }
}

/* Switch items that act as scene devices */

class Scene extends GenericDevice {
  static get type() {
    return 'action.devices.types.SCENE';
  }

  static get traits() {
    return [
      'action.devices.traits.Scene'
    ];
  }

  static get requiredItemType() {
    return 'Switch'
  }

  static getAttributes() {
    return {
      sceneReversible: true
    };
  }
}

/* Switch items that act as lock devices */

class Lock extends GenericDevice {
  static get type() {
    return 'action.devices.types.LOCK';
  }

  static get traits() {
    return [
      'action.devices.traits.LockUnlock'
    ];
  }

  static get requiredItemType() {
    return 'Switch';
  }

  static getState(item) {
    return {
      isLocked: item.state === 'ON'
    };
  }
}

/* Switch items that act as security system devices */

class SecuritySystem extends GenericDevice {
  static get type() {
    return 'action.devices.types.SECURITYSYSTEM';
  }

  static get traits() {
    return [
      'action.devices.traits.ArmDisarm'
    ];
  }

  static get requiredItemType() {
    return 'Switch';
  }

  static getState(item) {
    return {
      isArmed: item.state === 'ON'
    };
  }
}

/* Switch items that act as lighting devices */

class SimpleLight extends Switch {
  static get type() {
    return 'action.devices.types.LIGHT';
  }
}

/* Dimmer items that act as lighting devices */

class DimmableLight extends GenericDevice {
  static get type() {
    return 'action.devices.types.LIGHT';
  }

  static get traits() {
    return [
      'action.devices.traits.OnOff',
      'action.devices.traits.Brightness'
    ];
  }

  static get requiredItemType() {
    return 'Dimmer';
  }

  static getState(item) {
    return {
      on: item.state > 0,
      brightness: item.state
    };
  }
}

/* Color items that act as lighting devices */

class ColorLight extends GenericDevice {
  static get type() {
    return 'action.devices.types.LIGHT';
  }

  static get traits() {
    return [
      'action.devices.traits.OnOff',
      'action.devices.traits.Brightness',
      'action.devices.traits.ColorSetting'
    ];
  }

  static getAttributes() {
    return {
      colorModel: 'hsv'
    };
  }

  static get requiredItemType() {
    return 'Color';
  }

  static getState(item) {
    const hsvArray = item.state.split(",").map((val) => Number(val));
    return {
      on: hsvArray[2] > 0,
      brightness: hsvArray[2],
      color: {
        spectrumHSV: {
          hue: hsvArray[0],
          saturation: hsvArray[1] / 100,
          value: hsvArray[2] / 100
        }
      }
    };
  }
}

/* Rollershutter items that act as open-close / start-stop devices */

class GenericOpenCloseDevice extends GenericDevice {
  static get traits() {
    return [
      'action.devices.traits.OpenClose',
      'action.devices.traits.StartStop'
    ];
  }

  static get requiredItemType() {
    return 'Rollershutter';
  }

  static getState(item) {
    return {
      openPercent: 100 - Number(item.state)
    };
  }
}

class Awning extends GenericOpenCloseDevice {
  static get type() {
    return 'action.devices.types.AWNING';
  }
}

class Blinds extends GenericOpenCloseDevice {
  static get type() {
    return 'action.devices.types.BLINDS';
  }
}

class Curtain extends GenericOpenCloseDevice {
  static get type() {
    return 'action.devices.types.CURTAIN';
  }
}

class Door extends GenericOpenCloseDevice {
  static get type() {
    return 'action.devices.types.DOOR';
  }
}

class Garage extends GenericOpenCloseDevice {
  static get type() {
    return 'action.devices.types.GARAGE';
  }
}

class Gate extends GenericOpenCloseDevice {
  static get type() {
    return 'action.devices.types.GATE';
  }
}

class Pergola extends GenericOpenCloseDevice {
  static get type() {
    return 'action.devices.types.PERGOLA';
  }
}

class Shutter extends GenericOpenCloseDevice {
  static get type() {
    return 'action.devices.types.SHUTTER';
  }
}

class Window extends GenericOpenCloseDevice {
  static get type() {
    return 'action.devices.types.WINDOW';
  }
}

class Speaker extends GenericDevice {
  static get type() {
    return 'action.devices.types.SPEAKER';
  }

  static get traits() {
    return [
      'action.devices.traits.Volume'
    ];
  }

  static get requiredItemType() {
    return 'Dimmer';
  }

  static getState(item) {
    return {
      currentVolume: item.state,
      isMuted: item.state === 0
    };
  }
}

class Thermostat extends GenericDevice {
  static get type() {
    return 'action.devices.types.THERMOSTAT';
  }

  static get traits() {
    return [
      'action.devices.traits.TemperatureSetting'
    ];
  }

  static getAttributes(item) {
    return {
      availableThermostatModes: 'off,heat,cool,on,heatcool',
      thermostatTemperatureUnit: this.usesFahrenheit(item) ? 'F' : 'C'
    };
  }

  static checkItemType(item) {
    return item.type === 'Group';
  }

  static getState(item) {
    const state = {};
    const members = this.getMembers(item);
    if (members.thermostatMode) {
      state.thermostatMode = this.normalizeThermostatMode(members.thermostatMode.state);
    }
    if (members.thermostatTemperatureSetpoint) {
      state.thermostatTemperatureSetpoint = Number(parseFloat(members.thermostatTemperatureSetpoint.state).toFixed(1));
      if (this.usesFahrenheit(item)) {
        state.thermostatTemperatureSetpoint = this.convertToCelsius(state.thermostatTemperatureSetpoint);
      }
    }
    if (members.thermostatTemperatureAmbient) {
      state.thermostatTemperatureAmbient = Number(parseFloat(members.thermostatTemperatureAmbient.state).toFixed(1));
      if (this.usesFahrenheit(item)) {
        state.thermostatTemperatureAmbient = this.convertToCelsius(state.thermostatTemperatureAmbient);
      }
    }
    if (members.thermostatHumidityAmbient) {
      state.thermostatHumidityAmbient = Number(parseFloat(members.thermostatHumidityAmbient.state).toFixed(0));
    }
    return state;
  }

  static getMembers(item) {
    const members = {};
    item.members.forEach((member) => {
      if (member.metadata && member.metadata.ga) {
        if (member.metadata.ga.value.toLowerCase() === 'heatingcoolingmode') {
          members.thermostatMode = { name: member.name, state: member.state };
        }
        if (member.metadata.ga.value.toLowerCase() === 'targettemperature') {
          members.thermostatTemperatureSetpoint = { name: member.name, state: member.state };
        }
        if (member.metadata.ga.value.toLowerCase() === 'currenttemperature') {
          members.thermostatTemperatureAmbient = { name: member.name, state: member.state };
        }
        if (member.metadata.ga.value.toLowerCase() === 'currenthumidity') {
          members.thermostatHumidityAmbient = { name: member.name, state: member.state };
        }
      }
    });
    return members;
  }

  static usesFahrenheit(item) {
    return item.metadata.ga.config && item.metadata.ga.config.useFahrenheit === true;
  }

  static get _modeMap() {
    return ['off', 'heat', 'cool', 'on'];
  }

  static normalizeThermostatMode(mode) {
    let normalizedMode = mode.replace('-', '');
    const intMode = parseInt(mode);
    if (!isNaN(intMode)) {
      normalizedMode = intMode in this._modeMap ? this._modeMap[intMode] : 'off';
    }
    return normalizedMode.toLowerCase()
  }

  static denormalizeThermostatMode(oldMode, newMode) {
    let denormalizedMode = newMode.replace('-', '').replace('heatcool', 'on');
    if (!isNaN(parseInt(oldMode))) {
      denormalizedMode = this._modeMap.indexOf(newMode);
      if (denormalizedMode < 0) {
        denormalizedMode = 0;
      }
    }
    return denormalizedMode.toString();
  }

  static convertToFahrenheit(value = 0) {
    return Math.round(value * 9 / 5 + 32);
  }

  static convertToCelsius(value = 0) {
    return ((value - 32) * 5 / 9).toFixed(2);
  }
}

const Devices = [
  Switch, Outlet, Fan, CoffeeMaker, WaterHeater, Fireplace,
  Valve,
  Sprinkler, Vacuum,
  Scene,
  Lock,
  SecuritySystem,
  SimpleLight, DimmableLight, ColorLight,
  Awning, Blinds, Curtain, Door, Garage, Gate, Shutter, Pergola, Window,
  Speaker,
  Thermostat
];

module.exports = {
  getDeviceForItem
}

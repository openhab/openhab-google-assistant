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

const hasTag = (item = {}, tag = '') => {
  return item.tags && item.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase()) || false;
};

const getDeviceForItem = (item = {}) => {
  return Devices.find((device) => (
    (
      item.metadata && item.metadata.ga &&
      device.type.toLowerCase() === `action.devices.types.${item.metadata.ga.value}`.toLowerCase() ||
      hasTag(item, device.type.substr(21).replace('SWITCH', 'SWITCHABLE').replace('LIGHT', 'LIGHTING'))
    ) && device.checkItemType(item)
  ));
};

const getConfig = (item = {}) => {
  return item && item.metadata && item.metadata.ga && item.metadata.ga.config || {};
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
    const config = getConfig(item);
    return {
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
        model: item.label,
        hwVersion: '2.5.0',
        swVersion: '2.5.0'
      },
      attributes: this.getAttributes(item),
      customData: {
        itemType: item.type === 'Group' ? item.groupType : item.type,
        deviceType: this.type,
        inverted: config.inverted === true,
        tfaAck: config.tfaAck,
        tfaPin: config.tfaPin
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

  static get requiredItemTypes() {
    return ['Switch'];
  }

  static getState(item) {
    let state = item.state === 'ON';
    if (getConfig(item).inverted === true) {
      state = !state;
    }
    return {
      on: state
    };
  }
}

class Outlet extends Switch {
  static get type() {
    return 'action.devices.types.OUTLET';
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

class SimpleFan extends Switch {
  static get type() {
    return 'action.devices.types.FAN';
  }
}

class SimpleHood extends Switch {
  static get type() {
    return 'action.devices.types.HOOD';
  }
}

class SimpleAirPurifier extends Switch {
  static get type() {
    return 'action.devices.types.AIRPURIFIER'
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

  static get requiredItemTypes() {
    return ['Switch'];
  }

  static getState(item) {
    let state = item.state === 'ON';
    if (getConfig(item).inverted === true) {
      state = !state;
    }
    return {
      openPercent: state ? 100 : 0
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

  static get requiredItemTypes() {
    return ['Switch'];
  }

  static getState(item) {
    let state = item.state === 'ON';
    if (getConfig(item).inverted === true) {
      state = !state;
    }
    return {
      isRunning: state,
      isPaused: !state
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

  static get requiredItemTypes() {
    return ['Switch'];
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

  static get requiredItemTypes() {
    return ['Switch'];
  }

  static getState(item) {
    let state = item.state === 'ON';
    if (getConfig(item).inverted === true) {
      state = !state;
    }
    return {
      isLocked: state
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

  static get requiredItemTypes() {
    return ['Switch'];
  }

  static getState(item) {
    let state = item.state === 'ON';
    if (getConfig(item).inverted === true) {
      state = !state;
    }
    return {
      isArmed: state
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

  static get requiredItemTypes() {
    return ['Dimmer'];
  }

  static getState(item) {
    let brightness = Number(item.state) || 0;
    return {
      on: brightness > 0,
      brightness: brightness
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

  static getAttributes(item) {
    const attributes = {
      colorModel: 'hsv'
    };
    const config = getConfig(item);
    if ('colorTemperatureRange' in config) {
      const [min, max] = config.colorTemperatureRange.split(',').map(s => Number(s.trim()));
      if (!isNaN(min) && !isNaN(max)) {
        attributes.colorTemperatureRange = {
          temperatureMinK: min,
          temperatureMaxK: max
        };
      }
    }
    return attributes;
  }

  static get requiredItemTypes() {
    return ['Color'];
  }

  static getState(item) {
    const [hue, sat, val] = item.state.split(',').map(s => Number(s.trim()));
    return {
      on: val > 0,
      brightness: val,
      color: {
        spectrumHSV: {
          hue: hue,
          saturation: sat / 100,
          value: val / 100
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

  static getAttributes(item) {
    const attributes = {};
    attributes.discreteOnlyOpenClose = getConfig(item).discreteOnlyOpenClose === true;
    attributes.queryOnlyOpenClose = getConfig(item).queryOnlyOpenClose === true;
    const itemType = item.type === 'Group' && item.groupType ? item.groupType : item.type;
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
    return ['Rollershutter', 'Switch'];
  }

  static getState(item) {
    let state = 0;
    const itemType = item.type === 'Group' ? item.groupType : item.type;
    if (itemType == 'Switch') {
      state = item.state === 'ON' ? 0 : 100;
    } else {
      state = Number(item.state);
    }
    return {
      openPercent: getConfig(item).inverted !== true ? 100 - state : state
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

  static get requiredItemTypes() {
    return ['Dimmer'];
  }

  static getState(item) {
    const volume = Number(item.state) || 0;
    return {
      currentVolume: volume,
      isMuted: volume === 0
    };
  }
}

class Camera extends GenericDevice {
  static get type() {
    return 'action.devices.types.CAMERA';
  }

  static get traits() {
    return [
      'action.devices.traits.CameraStream'
    ];
  }

  static getAttributes(item) {
    return {
      cameraStreamSupportedProtocols: (getConfig(item).protocols || 'hls,dash').split(',').map(s => s.trim()),
      cameraStreamNeedAuthToken: getConfig(item).token ? true : false,
      cameraStreamNeedDrmEncryption: false
    };
  }

  static get requiredItemTypes() {
    return ['String'];
  }
}

class Fan extends GenericDevice {
  static get type() {
    return 'action.devices.types.FAN';
  }

  static get traits() {
    return [
      'action.devices.traits.OnOff',
      'action.devices.traits.FanSpeed'
    ];
  }

  static getAttributes(item) {
    const config = getConfig(item);
    if (!config || !config.speeds) {
      return {};
    }
    const attributes = {
      availableFanSpeeds: {
        speeds: [],
        ordered: config.ordered === true
      },
      reversible: false
    };
    config.speeds.split(',').forEach((speedEntry) => {
      try {
        const [speedName, speedSynonyms] = speedEntry.trim().split('=').map(s => s.trim());
        attributes.availableFanSpeeds.speeds.push({
          speed_name: speedName,
          speed_values: [{
            speed_synonym: speedSynonyms.split(':').map(s => s.trim()),
            lang: config.lang || 'en'
          }]
        });
      } catch (e) { }
    });
    return attributes;
  }

  static get requiredItemTypes() {
    return ['Dimmer'];
  }

  static getState(item) {
    return {
      currentFanSpeedSetting: item.state.toString(),
      on: Number(item.state) > 0
    };
  }
}

class Hood extends Fan {
  static get type() {
    return 'action.devices.types.HOOD';
  }
}

class AirPurifier extends Fan {
  static get type() {
    return 'action.devices.types.AIRPURIFIER';
  }
}

/* Sensor items */

class Sensor extends GenericDevice {
  static get type() {
    return 'action.devices.types.SENSOR';
  }

  static get traits() {
    return [
      'action.devices.traits.SensorState'
    ];
  }

  static getAttributes(item) {
    const config = getConfig(item);
    if (!config || !config.sensorName) {
      return {};
    }
    const attributes = {
      sensorStatesSupported: {
        name: config.sensorName
      }
    };
    if (config.valueUnit) {
      attributes.sensorStatesSupported.numericCapabilities = {}
      attributes.sensorStatesSupported.numericCapabilities.rawValueUnit = config.valueUnit
    }
    if (config.states) {
      attributes.sensorStatesSupported.descriptiveCapabilities = {}
      attributes.sensorStatesSupported.descriptiveCapabilities.availableStates = config.states.split(',').map(s => s.trim().split('=')[0].trim());
    }
    return attributes;
  }

  static getState(item) {
    const config = getConfig(item);
    return {
      currentSensorStateData: {
        name: config.sensorName,
        currentSensorState: this.translateStateToGoogle(item),
        rawValue: Number(item.state) || 0
      }
    };
  }

  static translateStateToGoogle(item) {
    const config = getConfig(item);
    if ('states' in config) {
      const states = config.states.split(',').map(s => s.trim())
      for (const state of states) {
        const [key, value] = state.split('=').map(s => s.trim());
        if (value == item.state) {
          return key;
        }
      }
    }
    return '';
  }
}

/* Thermostat items formed by a group of items */

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
    const config = getConfig(item);
    const attributes = {
      thermostatTemperatureUnit: this.usesFahrenheit(item) ? 'F' : 'C'
    };
    if ('thermostatTemperatureRange' in config) {
      const [min, max] = config.thermostatTemperatureRange.split(',').map(s => parseFloat(s.trim()));
      if (!isNaN(min) && !isNaN(max)) {
        attributes.thermostatTemperatureRange = {
          minThresholdCelsius: min,
          maxThresholdCelsius: max
        }
      }
    }
    const members = this.getMembers(item);
    if (('thermostatTemperatureAmbient' in members) &&
      !('thermostatMode' in members) &&
      !('thermostatTemperatureSetpoint' in members)) {
      attributes.queryOnlyTemperatureSetting = true;
    } else {
      attributes.availableThermostatModes = Object.keys(this.getModeMap(item)).join(',');
    }
    return attributes;
  }

  static checkItemType(item) {
    return item.type === 'Group';
  }

  static getState(item) {
    const state = {};
    const members = this.getMembers(item);
    for (const member in members) {
      if (member == 'thermostatMode') {
        state[member] = this.translateModeToGoogle(item, members[member].state);
      } else {
        state[member] = Number(parseFloat(members[member].state).toFixed(1));
        if (member.indexOf('Temperature') > 0 && this.usesFahrenheit(item)) {
          state[member] = this.convertToCelsius(state[member]);
        }
      }
    }
    return state;
  }

  static getMembers(item) {
    const supportedMembers = [
      'thermostatMode',
      'thermostatTemperatureSetpoint',
      'thermostatTemperatureSetpointHigh',
      'thermostatTemperatureSetpointLow',
      'thermostatTemperatureAmbient',
      'thermostatHumidityAmbient'
    ];
    const members = {};
    if (item.members && item.members.length) {
      item.members.forEach((member) => {
        if (member.metadata && member.metadata.ga) {
          const memberType = supportedMembers.find(m => member.metadata.ga.value.toLowerCase() === m.toLowerCase());
          if (memberType) {
            members[memberType] = { name: member.name, state: member.state };
          }
        } else {
          if (hasTag(member, 'HeatingCoolingMode') || hasTag(member, 'homekit:HeatingCoolingMode') || hasTag(member, 'homekit:TargetHeatingCoolingMode') || hasTag(member, 'homekit:CurrentHeatingCoolingMode')) {
            members.thermostatMode = { name: member.name, state: member.state };
          }
          if (hasTag(member, 'TargetTemperature') || hasTag(member, 'homekit:TargetTemperature')) {
            members.thermostatTemperatureSetpoint = { name: member.name, state: member.state };
          }
          if (hasTag(member, 'CurrentTemperature')) {
            members.thermostatTemperatureAmbient = { name: member.name, state: member.state };
          }
          if (hasTag(member, 'CurrentHumidity')) {
            members.thermostatHumidityAmbient = { name: member.name, state: member.state };
          }
        }
      });
    }
    return members;
  }

  static usesFahrenheit(item) {
    return getConfig(item).useFahrenheit === true || hasTag(item, 'Fahrenheit');
  }

  static getModeMap(item) {
    const config = getConfig(item);
    let modes = ['off', 'heat', 'cool', 'on', 'heatcool', 'auto', 'eco'];
    if ('modes' in config) {
      modes = config.modes.split(',').map(s => s.trim());
    }
    const modeMap = {};
    modes.forEach(pair => {
      const [key, value] = pair.split('=').map(s => s.trim());
      modeMap[key] = value ? value.split(':').map(s => s.trim()) : [key];
    });
    return modeMap;
  }

  static translateModeToOpenhab(item, mode) {
    const modeMap = this.getModeMap(item);
    if (mode in modeMap) {
      return modeMap[mode][0];
    }
    throw { statusCode: 400 };
  }

  static translateModeToGoogle(item, mode) {
    const modeMap = this.getModeMap(item);
    for (const key in modeMap) {
      if (modeMap[key].includes(mode)) {
        return key;
      }
    }
    return 'on';
  }

  static convertToFahrenheit(value = 0) {
    return Math.round(value * 9 / 5 + 32);
  }

  static convertToCelsius(value = 0) {
    return Number(((value - 32) * 5 / 9).toFixed(1));
  }
}

const Devices = [
  Switch, Outlet, CoffeeMaker, WaterHeater, Fireplace,
  Valve,
  Sprinkler, Vacuum,
  Scene,
  Lock,
  SecuritySystem,
  SimpleLight, DimmableLight, ColorLight,
  Awning, Blinds, Curtain, Door, Garage, Gate, Shutter, Pergola, Window,
  Speaker,
  Camera,
  SimpleFan, Fan,
  SimpleHood, Hood,
  SimpleAirPurifier, AirPurifier,
  Sensor,
  Thermostat
];

module.exports = {
  getDeviceForItem,
  Thermostat
}

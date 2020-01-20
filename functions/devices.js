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
        nicknames: [config.name || item.label, ...(item.metadata && item.metadata.synonyms ? item.metadata.synonyms.value.split(',') : [])]
      },
      willReportState: false,
      roomHint: config.roomHint,
      structureHint: config.structureHint,
      deviceInfo: {
        manufacturer: 'openHAB',
        model: item.type,
        hwVersion: '2.5.0',
        swVersion: '2.5.0'
      },
      attributes: this.getAttributes(item),
      customData: {
        itemType: item.type,
        deviceType: this.type,
        tfaAck: config.tfaAck,
        tfaPin: config.tfaPin
      }
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
    const colorTemperatureRange = getConfig(item).colorTemperatureRange;
    if (colorTemperatureRange) {
      try {
        const range = colorTemperatureRange.split(',');
        attributes.colorTemperatureRange = {
          temperatureMinK: Number(range[0]),
          temperatureMaxK: Number(range[1])
        };
      } catch (err) { }
    }
    return attributes;
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

  static getMetadata(item) {
    const metadata = super.getMetadata(item);
    metadata.customData.inverted = getConfig(item).inverted === true;
    return metadata;
  }

  static get requiredItemType() {
    return 'Rollershutter';
  }

  static getState(item) {
    return {
      openPercent: getConfig(item).inverted === true ? Number(item.state) : 100 - Number(item.state)
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
      cameraStreamSupportedProtocols: (getConfig(item).protocols || 'hls,dash').split(','),
      cameraStreamNeedAuthToken: getConfig(item).token ? true : false,
      cameraStreamNeedDrmEncryption: false
    };
  }

  static get requiredItemType() {
    return 'String';
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
        const [speedName, speedSynonyms] = speedEntry.split('=');
        attributes.availableFanSpeeds.speeds.push({
          speed_name: speedName,
          speed_values: [{
            speed_synonym: speedSynonyms.split(':'),
            lang: config.lang || 'en'
          }]
        });
      } catch (e) { }
    });
    return attributes;
  }

  static get requiredItemType() {
    return 'Dimmer';
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
    const attributes = {
      thermostatTemperatureUnit: this.usesFahrenheit(item) ? 'F' : 'C'
    };
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

  static getMetadata(item) {
    const metadata = super.getMetadata(item);
    const members = this.getMembers(item);
    for (const member in members) {
      metadata.customData[member] = members[member].name;
    }
    return metadata;
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
      modes = getConfig(item).modes.split(',');
    }
    const modeMap = {};
    modes.forEach(pair => {
      const [ key, value ] = pair.split('=');
      modeMap[key] = value ? value.split(':') : [key];
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
  Thermostat
];

module.exports = {
  getDeviceForItem,
  Thermostat
}

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
class GenericDevice {
  static hasTag(item = { tags: [] }, tag = '') {
    return item.tags && item.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase());
  }

  static get type() {
    return '';
  }

  static get traits() {
    return [];
  }

  static getAttributes(item) {
    return {};
  }

  static get tag() {
    return '';
  }

  static appliesTo(item) {
    return this.hasTag(item, this.tag);
  }

  static getState(item) {
    return {};
  }
}

class Switch extends GenericDevice {
  static get type() {
    return 'action.devices.types.SWITCH';
  }

  static get traits() {
    return [
      'action.devices.traits.OnOff'
    ];
  }

  static get tag() {
    return 'Switchable';
  }

  static appliesTo(item) {
    return this.hasTag(item, this.tag) && (item.type === 'Switch' || (item.type === 'Group' && item.groupType && item.groupType === 'Switch'));
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

  static get tag() {
    return 'Outlet';
  }
}

class Valve extends Switch {
  static get type() {
    return 'action.devices.types.VALVE';
  }

  static get tag() {
    return 'Valve';
  }
}

class Scene extends GenericDevice {
  static get type() {
    return 'action.devices.types.SCENE';
  }

  static get traits() {
    return [
      'action.devices.traits.Scene'
    ];
  }

  static getAttributes(item) {
    return {
      sceneReversible: true
    };
  }

  static get tag() {
    return 'Scene';
  }

  static appliesTo(item) {
    return this.hasTag(item, this.tag) && (item.type === 'Switch' || (item.type === 'Group' && item.groupType && item.groupType === 'Switch'));
  }
}

class Lock extends GenericDevice {
  static get type() {
    return 'action.devices.types.LOCK';
  }

  static get traits() {
    return [
      'action.devices.traits.LockUnlock'
    ];
  }

  static get tag() {
    return 'Lock';
  }

  static appliesTo(item) {
    return this.hasTag(item, this.tag) && (item.type === 'Switch' || (item.type === 'Group' && item.groupType && item.groupType === 'Switch'));
  }

  static getState(item) {
    return {
      isLocked: item.state === 'ON'
    };
  }
}


class SimpleLight extends Switch {
  static get type() {
    return 'action.devices.types.LIGHT';
  }

  static get tag() {
    return 'Lighting';
  }
}

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

  static get tag() {
    return 'Lighting';
  }

  static appliesTo(item) {
    return this.hasTag(item, this.tag) && (item.type === 'Dimmer' || (item.type === 'Group' && item.groupType && item.groupType === 'Dimmer'));
  }

  static getState(item) {
    return {
      on: item.state > 0,
      brightness: item.state
    };
  }
}

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
    return {
      colorModel: 'hsv'
    };
  }

  static get tag() {
    return 'Lighting';
  }
  static appliesTo(item) {
    return this.hasTag(item, this.tag) && (item.type === 'Color' || (item.type === 'Group' && item.groupType && item.groupType === 'Color'));
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

class GenericOpenCloseDevice extends GenericDevice {
  static get traits() {
    return [
      'action.devices.traits.OpenClose',
      'action.devices.traits.StartStop'
    ];
  }

  static appliesTo(item) {
    return this.hasTag(item, this.tag) && (item.type === 'Rollershutter' || (item.type === 'Group' && item.groupType && item.groupType === 'Rollershutter'));
  }

  static getState(item) {
    return {
      openPercent: 100 - Number(item.state)
    };
  }
}

class Blinds extends GenericOpenCloseDevice {
  static get type() {
    return 'action.devices.types.BLINDS';
  }

  static get tag() {
    return 'Blinds';
  }
}

class Shutter extends GenericOpenCloseDevice {
  static get type() {
    return 'action.devices.types.SHUTTER';
  }

  static get tag() {
    return 'Shutter';
  }
}

class Curtain extends GenericOpenCloseDevice {
  static get type() {
    return 'action.devices.types.CURTAIN';
  }

  static get tag() {
    return 'Curtain';
  }
}

class Door extends GenericOpenCloseDevice {
  static get type() {
    return 'action.devices.types.DOOR';
  }

  static get tag() {
    return 'Door';
  }
}

class Gate extends GenericOpenCloseDevice {
  static get type() {
    return 'action.devices.types.GATE';
  }

  static get tag() {
    return 'Gate';
  }
}

class Garage extends GenericOpenCloseDevice {
  static get type() {
    return 'action.devices.types.GARAGE';
  }

  static get tag() {
    return 'Garage';
  }
}

class Pergola extends GenericOpenCloseDevice {
  static get type() {
    return 'action.devices.types.PERGOLA';
  }

  static get tag() {
    return 'Pergola';
  }
}

class Window extends GenericOpenCloseDevice {
  static get type() {
    return 'action.devices.types.WINDOW';
  }

  static get tag() {
    return 'Window';
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

  static get tag() {
    return 'Thermostat';
  }

  static appliesTo(item) {
    return this.hasTag(item, this.tag) && item.type === 'Group';
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
      if (this.hasTag(member, 'HeatingCoolingMode') || this.hasTag(member, 'homekit:HeatingCoolingMode') || this.hasTag(member, 'homekit:TargetHeatingCoolingMode') || this.hasTag(member, 'homekit:CurrentHeatingCoolingMode')) {
        members.thermostatMode = { name: member.name, state: member.state };
      }
      if (this.hasTag(member, 'TargetTemperature') || this.hasTag(member, 'homekit:TargetTemperature')) {
        members.thermostatTemperatureSetpoint = { name: member.name, state: member.state };
      }
      if (this.hasTag(member, 'CurrentTemperature')) {
        members.thermostatTemperatureAmbient = { name: member.name, state: member.state };
      }
      if (this.hasTag(member, 'CurrentHumidity')) {
        members.thermostatHumidityAmbient = { name: member.name, state: member.state };
      }
    });
    return members;
  }

  static usesFahrenheit(item) {
    return this.hasTag(item, 'Fahrenheit');
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

const Devices = [Switch, Outlet, Valve, Scene, Lock, SimpleLight, DimmableLight, ColorLight, Blinds, Shutter, Curtain, Door, Gate, Garage, Pergola, Window, Thermostat];

module.exports = { Devices, Switch, Outlet, Valve, Scene, Lock, SimpleLight, DimmableLight, ColorLight, Blinds, Shutter, Curtain, Door, Gate, Garage, Pergola, Window, Thermostat }

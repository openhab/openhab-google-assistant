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
 * Command definitions for translating Google Actions Commands to openHAB Item Updates
 *
 * @author Michael Krug
 *
 */
const GenericDevice = require('./devices.js').GenericDevice;
const Thermostat = require('./devices.js').Thermostat;
const DeviceTypes = require('./devices.js').Devices;

class GenericCommand {
  constructor(apiHandler) {
    this._apiHandler = apiHandler;
  }

  static get type() {
    return '';
  }

  static appliesTo(command = '', params = {}) {
    return false;
  }

  static convertParamsToValue(item = {}, params = {}) {
    return null;
  }

  static getResponseStates(item = {}, params = {}) {
    return {};
  }

  static getItemName(item = {}) {
    return item.name;
  }

  execute(devices = [], params = {}, challenge = {}) {
    console.log(`openhabGoogleAssistant - ${this.constructor.type}: ${JSON.stringify({ devices: devices, params: params })}`);
    const commandsResponse = [];
    const promises = devices.map((device) => {
      return this._apiHandler.getItem(device.id).then((item) => {
        if (GenericDevice.hasTag(item, 'TFA-PIN') && (!challenge.pin || challenge.pin !== 1234)) {
          commandsResponse.push({
            ids: [device.id],
            status: 'ERROR',
            errorCode: 'challengeNeeded',
            challengeNeeded: {
              type: !challenge.pin ? 'pinNeeded' : 'challengeFailedPinNeeded'
            }
          });
          return;
        }

        const responseStates = this.constructor.getResponseStates(item, params);
        if (Object.keys(responseStates).length) {
          responseStates.online = true;
        }

        if (GenericDevice.hasTag(item, 'TFA-ACK') && challenge.ack !== true) {
          commandsResponse.push({
            ids: [device.id],
            status: 'ERROR',
            states: responseStates,
            errorCode: 'challengeNeeded',
            challengeNeeded: {
              type: 'ackNeeded'
            }
          });
          return;
        }

        const targetItem = this.constructor.getItemName(item);
        const targetValue = this.constructor.convertParamsToValue(item, params);
        return this._apiHandler.sendCommand(targetItem, targetValue).then(() => {
          commandsResponse.push({
            ids: [device.id],
            status: 'SUCCESS',
            states: responseStates
          });
        });
      }).catch((error) => {
        commandsResponse.push({
          ids: [device.id],
          status: 'ERROR',
          errorCode: error.statusCode == 404 ? 'deviceNotFound' : error.statusCode == 400 ? 'notSupported' : 'deviceOffline'
        });
      });
    });
    return Promise.all(promises).then(() => commandsResponse);
  }
}

class OnOffCommand extends GenericCommand {
  constructor(apiHandler) {
    super(apiHandler);
  }

  static get type() {
    return 'action.devices.commands.OnOff';
  }

  static appliesTo(command, params) {
    return command === this.type && ('on' in params) && typeof params.on === 'boolean';
  }

  static convertParamsToValue(item, params) {
    return params.on ? 'ON' : 'OFF';
  }

  static getResponseStates(item, params) {
    return {
      on: params.on
    };
  }
}

class LockUnlockCommand extends GenericCommand {
  constructor(apiHandler) {
    super(apiHandler);
  }

  static get type() {
    return 'action.devices.commands.LockUnlock';
  }

  static appliesTo(command, params) {
    return command === this.type && ('lock' in params) && typeof params.lock === 'boolean';
  }

  static convertParamsToValue(item, params) {
    return params.lock ? 'ON' : 'OFF';
  }

  static getResponseStates(item, params) {
    return {
      on: params.on
    };
  }
}

class ArmDisarmCommand extends GenericCommand {
  constructor(apiHandler) {
    super(apiHandler);
  }

  static get type() {
    return 'action.devices.commands.ArmDisarm';
  }

  static appliesTo(command, params) {
    return command === this.type && ('arm' in params) && typeof params.arm === 'boolean';
  }

  static convertParamsToValue(item, params) {
    return params.arm ? 'ON' : 'OFF';
  }

  static getResponseStates(item, params) {
    return {
      isArmed: params.arm
    };
  }
}

class ActivateSceneCommand extends GenericCommand {
  constructor(apiHandler) {
    super(apiHandler);
  }

  static get type() {
    return 'action.devices.commands.ActivateScene';
  }

  static appliesTo(command, params) {
    return command === this.type && (
      (('deactivate' in params) && typeof params.deactivate === 'boolean') ||
      !('deactivate' in params)
    );
  }

  static convertParamsToValue(item, params) {
    return !params.deactivate ? 'ON' : 'OFF';
  }
}


class SetVolumeCommand extends GenericCommand {
  constructor(apiHandler) {
    super(apiHandler);
  }

  static get type() {
    return 'action.devices.commands.setVolume';
  }

  static appliesTo(command, params) {
    return command === this.type && (('volumeLevel' in params) && typeof params.volumeLevel === 'number'
    );
  }

  static convertParamsToValue(item, params) {
    return params.volumeLevel.toString();
  }

  static getResponseStates(item, params) {
    return {
      currentVolume: params.volumeLevel,
      isMuted: params.volumeLevel === 0
    };
  }
}

class VolumeRelativeCommand extends GenericCommand {
  constructor(apiHandler) {
    super(apiHandler);
  }

  static get type() {
    return 'action.devices.commands.volumeRelative';
  }

  static appliesTo(command, params) {
    return command === this.type && (('volumeRelativeLevel' in params) && typeof params.volumeRelativeLevel === 'number'
    );
  }

  static convertParamsToValue(item, params) {
    return parseInt(item.state) + params.volumeRelativeLevel;
  }

  static getResponseStates(item, params) {
    const state = this.convertParamsToValue(item, params);
    return {
      currentVolume: state,
      isMuted: state === 0
    };
  }
}

class BrightnessAbsoluteCommand extends GenericCommand {
  constructor(apiHandler) {
    super(apiHandler);
  }

  static get type() {
    return 'action.devices.commands.BrightnessAbsolute';
  }

  static appliesTo(command, params) {
    return command === this.type && ('brightness' in params) && typeof params.brightness === 'number';
  }

  static convertParamsToValue(item, params) {
    return params.brightness.toString();
  }

  static getResponseStates(item, params) {
    return {
      brightness: params.brightness
    };
  }
}

class ColorAbsoluteCommand extends GenericCommand {
  constructor(apiHandler) {
    super(apiHandler);
  }

  static get type() {
    return 'action.devices.commands.ColorAbsolute';
  }

  static appliesTo(command, params) {
    return command === this.type && (
      (('color' in params) && typeof params.color === 'object') &&
      (('spectrumHSV' in params.color) && typeof params.color.spectrumHSV === 'object')
    );
  }

  static convertParamsToValue(item, params) {
    return [params.color.spectrumHSV.hue, params.color.spectrumHSV.saturation * 100, params.color.spectrumHSV.value * 100].join(',');
  }

  static getResponseStates(item, params) {
    return {
      on: params.color.spectrumHSV.value > 0,
      brightness: params.color.spectrumHSV.value,
      color: params.color
    };
  }
}

class OpenCloseCommand extends GenericCommand {
  constructor(apiHandler) {
    super(apiHandler);
  }

  static get type() {
    return 'action.devices.commands.OpenClose';
  }

  static appliesTo(command, params) {
    return command === this.type && ('openPercent' in params) && typeof params.openPercent === 'number';
  }

  static convertParamsToValue(item, params) {
    let value = params.openPercent === 0 ? 'DOWN' : params.openPercent === 100 ? 'UP' : (100 - params.openPercent).toString();
    for (const device of DeviceTypes) {
      if (device.appliesTo(item)) {
        // item can not handle StartStop --> we will send "ON" / "OFF"
        if (!device.traits.includes('action.devices.traits.StartStop')) {
          value = params.openPercent === 0 ? 'OFF' : 'ON';
        }
        break;
      }
    }
    return value;
  }

  static getResponseStates(item, params) {
    return {
      openPercent: params.openPercent
    };
  }
}

class StartStopCommand extends GenericCommand {
  constructor(apiHandler) {
    super(apiHandler);
  }

  static get type() {
    return 'action.devices.commands.StartStop';
  }

  static appliesTo(command, params) {
    return command === this.type && ('start' in params) && typeof params.start === 'boolean';
  }

  static convertParamsToValue(item, params) {
    let value = params.start ? 'MOVE' : 'STOP';
    for (const device of DeviceTypes) {
      if (device.appliesTo(item)) {
        // item can not handle OpenClose --> we will send "ON" / "OFF"
        if (!device.traits.includes('action.devices.traits.OpenClose')) {
          value = params.start ? 'ON' : 'OFF';
        }
        break;
      }
    }
    return value;
  }

  static getResponseStates(item, params) {
    return {
      isRunning: params.start,
      isPaused: !params.start
    };
  }
}

class ThermostatTemperatureSetpointCommand extends GenericCommand {
  constructor(apiHandler) {
    super(apiHandler);
  }

  static get type() {
    return 'action.devices.commands.ThermostatTemperatureSetpoint';
  }

  static appliesTo(command, params) {
    return command === this.type && ('thermostatTemperatureSetpoint' in params) && typeof params.thermostatTemperatureSetpoint === 'number';
  }

  static getItemName(item) {
    const members = Thermostat.getMembers(item);
    if (!members.thermostatTemperatureSetpoint) {
      throw { statusCode: 400 };
    }
    return members.thermostatTemperatureSetpoint.name;
  }

  static convertParamsToValue(item, params) {
    let value = params.thermostatTemperatureSetpoint.toString();
    if (Thermostat.usesFahrenheit(item)) {
      value = Thermostat.convertToFahrenheit(value);
    }
    return value;
  }

  static getResponseStates(item, params) {
    const states = Thermostat.getState(item);
    states.thermostatTemperatureSetpoint = params.thermostatTemperatureSetpoint;
    return states;
  }
}

class ThermostatSetModeCommand extends GenericCommand {
  constructor(apiHandler) {
    super(apiHandler);
  }

  static get type() {
    return 'action.devices.commands.ThermostatSetMode';
  }

  static appliesTo(command, params) {
    return command === this.type && ('thermostatMode' in params) && typeof params.thermostatMode === 'string';
  }

  static getItemName(item) {
    const members = Thermostat.getMembers(item);
    if (!members.thermostatMode) {
      throw { statusCode: 400 };
    }
    return members.thermostatMode.name;
  }

  static convertParamsToValue(item, params) {
    const members = Thermostat.getMembers(item);
    if (!members.thermostatMode) {
      throw { statusCode: 400 };
    }
    return Thermostat.denormalizeThermostatMode(members.thermostatMode.state, params.thermostatMode);
  }

  static getResponseStates(item, params) {
    const states = Thermostat.getState(item);
    states.thermostatMode = params.thermostatMode;
    return states;
  }
}

const Commands = [
  OnOffCommand,
  LockUnlockCommand,
  ArmDisarmCommand,
  ActivateSceneCommand,
  BrightnessAbsoluteCommand,
  SetVolumeCommand,
  VolumeRelativeCommand,
  ColorAbsoluteCommand,
  OpenCloseCommand,
  StartStopCommand,
  ThermostatTemperatureSetpointCommand,
  ThermostatSetModeCommand
];

module.exports = {
  Commands,
  OnOffCommand,
  LockUnlockCommand,
  ArmDisarmCommand,
  ActivateSceneCommand,
  SetVolumeCommand,
  VolumeRelativeCommand,
  BrightnessAbsoluteCommand,
  ColorAbsoluteCommand,
  OpenCloseCommand,
  StartStopCommand,
  ThermostatTemperatureSetpointCommand,
  ThermostatSetModeCommand
};

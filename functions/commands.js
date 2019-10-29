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
const Thermostat = require('./devices.js').Thermostat;

class GenericCommand {
  constructor(apiHandler) {
    this._apiHandler = apiHandler;
  }

  _triggerCommand(devices = [], targetState = '', responseStates = {}) {
    const commandsResponse = [];
    const promises = devices.map((device) => {
      return this._apiHandler.sendCommand(device.id, targetState).then(() => {
        if (Object.keys(responseStates).length) {
          responseStates.online = true;
        }
        commandsResponse.push({
          ids: [device.id],
          status: 'SUCCESS',
          states: responseStates
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

  execute(devices, params) {
    console.log(`openhabGoogleAssistant - commands.OnOff: ${JSON.stringify({ devices: devices, params: params })}`);
    const state = params.on ? 'ON' : 'OFF';
    return this._triggerCommand(devices, state, {
      on: params.on
    });
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

  execute(devices, params) {
    console.log(`openhabGoogleAssistant - commands.LockUnlock: ${JSON.stringify({ devices: devices, params: params })}`);
    const state = params.lock ? 'ON' : 'OFF';
    return this._triggerCommand(devices, state, {
      on: params.on
    });
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

  execute(devices, params) {
    console.log(`openhabGoogleAssistant - commands.ActivateScene: ${JSON.stringify({ devices: devices, params: params })}`);
    const state = !params.deactivate ? 'ON' : 'OFF';
    return this._triggerCommand(devices, state, {});
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

  execute(devices, params) {
    console.log(`openhabGoogleAssistant - commands.BrightnessAbsolute: ${JSON.stringify({ devices: devices, params: params })}`);
    const state = params.brightness.toString();
    return this._triggerCommand(devices, state, {
      brightness: params.brightness
    });
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

  execute(devices, params) {
    console.log(`openhabGoogleAssistant - commands.ColorAbsolute: ${JSON.stringify({ devices: devices, params: params })}`);
    const state = [params.color.spectrumHSV.hue, params.color.spectrumHSV.saturation * 100, params.color.spectrumHSV.value * 100].join(',');
    return this._triggerCommand(devices, state, {
      on: params.color.spectrumHSV.value > 0,
      brightness: params.color.spectrumHSV.value,
      color: params.color
    });
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

  execute(devices, params) {
    console.log(`openhabGoogleAssistant - commands.OpenClose: ${JSON.stringify({ devices: devices, params: params })}`);
    const state = params.openPercent == 0 ? 'DOWN' : params.openPercent == 100 ? 'UP' : (100 - params.openPercent).toString();
    return this._triggerCommand(devices, state, {
      openPercent: params.openPercent
    });
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

  execute(devices, params) {
    console.log(`openhabGoogleAssistant - commands.StartStop: ${JSON.stringify({ devices: devices, params: params })}`);
    const state = params.start ? 'MOVE' : 'STOP';
    return this._triggerCommand(devices, state, {
      isRunning: params.start,
      isPaused: !params.start
    });
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

  execute(devices, params) {
    console.log(`openhabGoogleAssistant - commands.ThermostatTemperatureSetpoint: ${JSON.stringify({ devices: devices, params: params })}`);
    const commandsResponse = [];
    const promises = devices.map((device) => {
      return this._apiHandler.getItem(device.id).then((item) => {
        const members = Thermostat.getMembers(item);
        if (!members.thermostatTemperatureSetpoint) {
          return Promise.reject({ statusCode: 400 });
        }
        let targetState = params.thermostatTemperatureSetpoint.toString();
        if (Thermostat.usesFahrenheit(item)) {
          targetState = Thermostat.convertToFahrenheit(targetState);
        }
        const state = Thermostat.getState(item);
        state.thermostatTemperatureSetpoint = params.thermostatTemperatureSetpoint;
        return this._apiHandler.sendCommand(members.thermostatTemperatureSetpoint.name, targetState).then(() => {
          commandsResponse.push({
            ids: [device.id],
            status: 'SUCCESS',
            states: state
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

  execute(devices, params) {
    console.log(`openhabGoogleAssistant - commands.ThermostatSetMode: ${JSON.stringify({ devices: devices, params: params })}`);
    const commandsResponse = [];
    const promises = devices.map((device) => {
      return this._apiHandler.getItem(device.id).then((item) => {
        const members = Thermostat.getMembers(item);
        if (!members.thermostatMode) {
          return Promise.reject({ statusCode: 400 });
        }
        const targetState = Thermostat.denormalizeThermostatMode(members.thermostatMode.state, params.thermostatMode);
        const state = Thermostat.getState(item);
        state.thermostatMode = params.thermostatMode;
        return this._apiHandler.sendCommand(members.thermostatMode.name, targetState).then(() => {
          commandsResponse.push({
            ids: [device.id],
            status: 'SUCCESS',
            states: state
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

const Commands = [OnOffCommand, LockUnlockCommand, ActivateSceneCommand, BrightnessAbsoluteCommand, ColorAbsoluteCommand, OpenCloseCommand, StartStopCommand, ThermostatTemperatureSetpointCommand, ThermostatSetModeCommand];

module.exports = { Commands, OnOffCommand, LockUnlockCommand, ActivateSceneCommand, BrightnessAbsoluteCommand, ColorAbsoluteCommand, OpenCloseCommand, StartStopCommand, ThermostatTemperatureSetpointCommand, ThermostatSetModeCommand };

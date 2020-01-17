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

const ackSupported = [
  'action.devices.commands.ArmDisarm',
  'action.devices.commands.Fill',
  'action.devices.commands.LockUnlock',
  'action.devices.commands.OnOff',
  'action.devices.commands.OpenClose',
  'action.devices.commands.ActivateScene',
  'action.devices.commands.ThermostatTemperatureSetpoint',
  'action.devices.commands.ThermostatTemperatureSetRange',
  'action.devices.commands.ThermostatSetMode',
  'action.devices.commands.TemperatureRelative'
];

const getCommandType = (command = '', params = {}) => {
  return CommandTypes.find((commandType) => command === commandType.type && commandType.validateParams(params));
};

class GenericCommand {
  static get type() {
    return '';
  }

  static validateParams(params = {}) {
    return false;
  }

  static convertParamsToValue(params = {}, item = {}, device = {}) {
    return null;
  }

  static getResponseStates(params = {}, item = {}) {
    return {};
  }

  static getItemName(device = {}) {
    return device.id;
  }

  static get requiresItem() {
    return false;
  }

  static handlAuthPin(device = {}, challenge = {}) {
    if (!device.customData || !device.customData.tfaPin || challenge.pin === device.customData.tfaPin) {
      return;
    }
    return {
      ids: [device.id],
      status: 'ERROR',
      errorCode: 'challengeNeeded',
      challengeNeeded: {
        type: !challenge.pin ? 'pinNeeded' : 'challengeFailedPinNeeded'
      }
    };
  }

  static handlAuthAck(device = {}, challenge = {}, responseStates = {}) {
    if (!device.customData || !device.customData.tfaAck || challenge.ack === true) {
      return;
    }
    return {
      ids: [device.id],
      status: 'ERROR',
      states: responseStates,
      errorCode: 'challengeNeeded',
      challengeNeeded: {
        type: 'ackNeeded'
      }
    };
  }

  static execute(apiHandler = {}, devices = [], params = {}, challenge = {}) {
    console.log(`openhabGoogleAssistant - ${this.type}: ${JSON.stringify({ devices: devices, params: params })}`);
    const commandsResponse = [];
    const promises = devices.map((device) => {

      const authPinResponse = this.handlAuthPin(device, challenge);
      if (authPinResponse) {
        commandsResponse.push(authPinResponse);
        return Promise.resolve();
      }

      const ackWithState = ackSupported.includes(this.type) && device.customData && device.customData.tfaAck && !challenge.ack;

      let getItemPromise = Promise.resolve(({}));
      if (this.requiresItem || ackWithState) {
        getItemPromise = apiHandler.getItem(device.id);
      }

      return getItemPromise.then((item) => {
        const responseStates = this.getResponseStates(params, item);
        if (Object.keys(responseStates).length) {
          responseStates.online = true;
        }

        const authAckResponse = this.handlAuthAck(device, challenge, responseStates);
        if (authAckResponse) {
          commandsResponse.push(authAckResponse);
          return;
        }

        const targetItem = this.getItemName(device);
        const targetValue = this.convertParamsToValue(params, item, device);
        let sendCommandPromise = Promise.resolve();
        if (typeof targetItem === 'string' && typeof targetValue === 'string') {
          sendCommandPromise = apiHandler.sendCommand(targetItem, targetValue);
        }
        return sendCommandPromise.then(() => {
          commandsResponse.push({
            ids: [device.id],
            status: 'SUCCESS',
            states: responseStates
          });
        });
      }).catch((error) => {
        console.error(`openhabGoogleAssistant - ${this.type}: ERROR ${JSON.stringify(error)}`);
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
  static get type() {
    return 'action.devices.commands.OnOff';
  }

  static validateParams(params) {
    return ('on' in params) && typeof params.on === 'boolean';
  }

  static convertParamsToValue(params) {
    return params.on ? 'ON' : 'OFF';
  }

  static getResponseStates(params) {
    return {
      on: params.on
    };
  }
}

class LockUnlockCommand extends GenericCommand {
  static get type() {
    return 'action.devices.commands.LockUnlock';
  }

  static validateParams(params) {
    return ('lock' in params) && typeof params.lock === 'boolean';
  }

  static convertParamsToValue(params) {
    return params.lock ? 'ON' : 'OFF';
  }

  static getResponseStates(params) {
    return {
      isLocked: params.lock
    };
  }
}

class ArmDisarmCommand extends GenericCommand {
  static get type() {
    return 'action.devices.commands.ArmDisarm';
  }

  static validateParams(params) {
    return ('arm' in params) && typeof params.arm === 'boolean';
  }

  static convertParamsToValue(params) {
    return params.arm ? 'ON' : 'OFF';
  }

  static getResponseStates(params) {
    return {
      isArmed: params.arm
    };
  }
}

class ActivateSceneCommand extends GenericCommand {
  static get type() {
    return 'action.devices.commands.ActivateScene';
  }

  static validateParams(params) {
    return (('deactivate' in params) && typeof params.deactivate === 'boolean') || !('deactivate' in params);
  }

  static convertParamsToValue(params) {
    return !params.deactivate ? 'ON' : 'OFF';
  }
}


class SetVolumeCommand extends GenericCommand {
  static get type() {
    return 'action.devices.commands.setVolume';
  }

  static validateParams(params) {
    return ('volumeLevel' in params) && typeof params.volumeLevel === 'number';
  }

  static convertParamsToValue(params) {
    return params.volumeLevel.toString();
  }

  static getResponseStates(params) {
    return {
      currentVolume: params.volumeLevel,
      isMuted: params.volumeLevel === 0
    };
  }
}

class VolumeRelativeCommand extends GenericCommand {
  static get type() {
    return 'action.devices.commands.volumeRelative';
  }

  static validateParams(params) {
    return ('volumeRelativeLevel' in params) && typeof params.volumeRelativeLevel === 'number';
  }

  static get requiresItem() {
    return true;
  }

  static convertParamsToValue(params, item) {
    let level = parseInt(item.state) + params.volumeRelativeLevel;
    return (level < 0 ? 0 : level > 100 ? 100 : level).toString();
  }

  static getResponseStates(params, item) {
    const state = parseInt(this.convertParamsToValue(params, item));
    return {
      currentVolume: state,
      isMuted: state === 0
    };
  }
}

class BrightnessAbsoluteCommand extends GenericCommand {
  static get type() {
    return 'action.devices.commands.BrightnessAbsolute';
  }

  static validateParams(params) {
    return ('brightness' in params) && typeof params.brightness === 'number';
  }

  static convertParamsToValue(params) {
    return params.brightness.toString();
  }

  static getResponseStates(params) {
    return {
      brightness: params.brightness
    };
  }
}

class ColorAbsoluteCommand extends GenericCommand {
  static get type() {
    return 'action.devices.commands.ColorAbsolute';
  }

  static validateParams(params) {
    return ('color' in params) && typeof params.color === 'object' &&
      ('spectrumHSV' in params.color) && typeof params.color.spectrumHSV === 'object';
  }

  static convertParamsToValue(params) {
    const hsv = params.color.spectrumHSV;
    return [hsv.hue, hsv.saturation * 100, hsv.value * 100].join(',');
  }

  static getResponseStates(params) {
    return {
      color: {
        spectrumHsv: params.color.spectrumHSV
      }
    };
  }
}

class ColorAbsoluteTemperatureCommand extends GenericCommand {
  static get type() {
    return 'action.devices.commands.ColorAbsolute';
  }

  static validateParams(params) {
    return ('color' in params) && typeof params.color === 'object' &&
      ('temperature' in params.color) && typeof params.color.temperature === 'number';
  }

  static get requiresItem() {
    return true;
  }

  static convertParamsToValue(params, item) {
    const hsv = this.rgb2hsv(this.kelvin2rgb(params.color.temperature));
    const hsvArray = item.state.split(",").map((val) => Number(val));
    return [Math.round(hsv.hue * 100) / 100, Math.round(hsv.saturation * 1000) / 10, hsvArray[2]].join(',');
  }

  static getResponseStates(params) {
    return {
      color: {
        temperatureK: params.color.temperature
      }
    };
  }

  static kelvin2rgb(kelvin) {
    const temp = kelvin / 100;
    const r = temp <= 66 ? 255 : 329.698727446 * Math.pow(temp - 60, -0.1332047592);
    const g = temp <= 66 ? 99.4708025861 * Math.log(temp) - 161.1195681661 : 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
    const b = temp <= 66 ? (temp <= 19 ? 0 : 138.5177312231 * Math.log(temp - 10) - 305.0447927307) : 255;
    return {
      r: r < 0 ? 0 : r > 255 ? 255 : Math.round(r),
      g: g < 0 ? 0 : g > 255 ? 255 : Math.round(g),
      b: b < 0 ? 0 : b > 255 ? 255 : Math.round(b),
    };
  }

  static rgb2hsv({ r, g, b }) {
    r = r / 255;
    g = g / 255;
    b = b / 255;
    let v = Math.max(r, g, b), n = v - Math.min(r, g, b);
    let h = n && ((v == r) ? (g - b) / n : ((v == g) ? 2 + (b - r) / n : 4 + (r - g) / n));
    return {
      hue: 60 * (h < 0 ? h + 6 : h),
      saturation: v && n / v,
      value: v
    };
  }
}

class OpenCloseCommand extends GenericCommand {
  static get type() {
    return 'action.devices.commands.OpenClose';
  }

  static validateParams(params) {
    return ('openPercent' in params) && typeof params.openPercent === 'number';
  }

  static convertParamsToValue(params, item, device) {
    let openPercent = params.openPercent;
    if (device.customData && device.customData.inverted === true) {
      openPercent = 100 - openPercent;
    }
    let value = openPercent === 0 ? 'DOWN' : openPercent === 100 ? 'UP' : (100 - openPercent).toString();
    // item can not handle OpenClose --> we will send "ON" / "OFF"
    if (device.customData && device.customData.itemType !== 'Rollershutter') {
      value = openPercent === 0 ? 'OFF' : 'ON';
    }
    return value;
  }

  static getResponseStates(params) {
    return {
      openPercent: params.openPercent
    };
  }
}

class StartStopCommand extends GenericCommand {
  static get type() {
    return 'action.devices.commands.StartStop';
  }

  static validateParams(params) {
    return ('start' in params) && typeof params.start === 'boolean';
  }

  static convertParamsToValue(params, item, device) {
    let value = params.start ? 'MOVE' : 'STOP';
    // item can not handle StartStop --> we will send "ON" / "OFF"
    if (device.customData && device.customData.itemType !== 'Rollershutter') {
      value = params.start ? 'ON' : 'OFF';
    }
    return value;
  }

  static getResponseStates(params) {
    return {
      isRunning: params.start,
      isPaused: !params.start
    };
  }
}

class SetFanSpeedCommand extends GenericCommand {
  static get type() {
    return 'action.devices.commands.SetFanSpeed';
  }

  static validateParams(params) {
    return ('fanSpeed' in params) && typeof params.fanSpeed === 'string';
  }

  static convertParamsToValue(params) {
    return params.fanSpeed.toString();
  }

  static getResponseStates(params) {
    return {
      currentFanSpeedSetting: params.fanSpeed
    };
  }
}

class GetCameraStreamCommand extends GenericCommand {
  static get type() {
    return 'action.devices.commands.GetCameraStream';
  }

  static validateParams(params) {
    return ('StreamToChromecast' in params) && typeof params.StreamToChromecast === 'boolean' &&
      ('SupportedStreamProtocols' in params) && typeof params.SupportedStreamProtocols === 'object';
  }

  static get requiresItem() {
    return true;
  }

  static convertParamsToValue() {
    return null;
  }

  static getResponseStates(params, item) {
    return {
      cameraStreamAccessUrl: item.state
    };
  }
}

class ThermostatTemperatureSetpointCommand extends GenericCommand {
  static get type() {
    return 'action.devices.commands.ThermostatTemperatureSetpoint';
  }

  static validateParams(params) {
    return ('thermostatTemperatureSetpoint' in params) && typeof params.thermostatTemperatureSetpoint === 'number';
  }

  static get requiresItem() {
    return true;
  }

  static getItemName(device) {
    if (!device.customData || !device.customData.thermostatTemperatureSetpoint) {
      throw { statusCode: 400 };
    }
    return device.customData.thermostatTemperatureSetpoint;
  }

  static convertParamsToValue(params, item) {
    let value = params.thermostatTemperatureSetpoint;
    if (Thermostat.usesFahrenheit(item)) {
      value = Thermostat.convertToFahrenheit(value);
    }
    return value.toString();
  }

  static getResponseStates(params, item) {
    const states = Thermostat.getState(item);
    states.thermostatTemperatureSetpoint = params.thermostatTemperatureSetpoint;
    return states;
  }
}

class ThermostatTemperatureSetpointHighCommand extends GenericCommand {
  static get type() {
    return 'action.devices.commands.ThermostatTemperatureSetpointHigh';
  }

  static validateParams(params) {
    return ('thermostatTemperatureSetpointHigh' in params) && typeof params.thermostatTemperatureSetpointHigh === 'number';
  }

  static get requiresItem() {
    return true;
  }

  static getItemName(device) {
    if (!device.customData || !device.customData.thermostatTemperatureSetpointHigh) {
      throw { statusCode: 400 };
    }
    return device.customData.thermostatTemperatureSetpointHigh;
  }

  static convertParamsToValue(params, item) {
    let value = params.thermostatTemperatureSetpointHigh;
    if (Thermostat.usesFahrenheit(item)) {
      value = Thermostat.convertToFahrenheit(value);
    }
    return value.toString();
  }

  static getResponseStates(params, item) {
    const states = Thermostat.getState(item);
    states.thermostatTemperatureSetpointHigh = params.thermostatTemperatureSetpointHigh;
    return states;
  }
}

class ThermostatTemperatureSetpointLowCommand extends GenericCommand {
  static get type() {
    return 'action.devices.commands.ThermostatTemperatureSetpointLow';
  }

  static validateParams(params) {
    return ('thermostatTemperatureSetpointLow' in params) && typeof params.thermostatTemperatureSetpointLow === 'number';
  }

  static get requiresItem() {
    return true;
  }

  static getItemName(device) {
    if (!device.customData || !device.customData.thermostatTemperatureSetpointLow) {
      throw { statusCode: 400 };
    }
    return device.customData.thermostatTemperatureSetpointLow;
  }

  static convertParamsToValue(params, item) {
    let value = params.thermostatTemperatureSetpointLow;
    if (Thermostat.usesFahrenheit(item)) {
      value = Thermostat.convertToFahrenheit(value);
    }
    return value.toString();
  }

  static getResponseStates(params, item) {
    const states = Thermostat.getState(item);
    states.thermostatTemperatureSetpointLow = params.thermostatTemperatureSetpointLow;
    return states;
  }
}

class ThermostatSetModeCommand extends GenericCommand {
  static get type() {
    return 'action.devices.commands.ThermostatSetMode';
  }

  static validateParams(params) {
    return ('thermostatMode' in params) && typeof params.thermostatMode === 'string';
  }

  static get requiresItem() {
    return true;
  }

  static getItemName(device) {
    if (!device.customData || !device.customData.thermostatMode) {
      throw { statusCode: 400 };
    }
    return device.customData.thermostatMode;
  }

  static convertParamsToValue(params, item) {
    const members = Thermostat.getMembers(item);
    if (!members.thermostatMode) {
      throw { statusCode: 400 };
    }
    return Thermostat.denormalizeThermostatMode(members.thermostatMode.state, params.thermostatMode);
  }

  static getResponseStates(params, item) {
    const states = Thermostat.getState(item);
    states.thermostatMode = params.thermostatMode;
    return states;
  }
}

const CommandTypes = [
  OnOffCommand,
  LockUnlockCommand,
  ArmDisarmCommand,
  ActivateSceneCommand,
  BrightnessAbsoluteCommand,
  SetVolumeCommand,
  VolumeRelativeCommand,
  ColorAbsoluteCommand,
  ColorAbsoluteTemperatureCommand,
  OpenCloseCommand,
  StartStopCommand,
  SetFanSpeedCommand,
  GetCameraStreamCommand,
  ThermostatTemperatureSetpointCommand,
  ThermostatTemperatureSetpointHighCommand,
  ThermostatTemperatureSetpointLowCommand,
  ThermostatSetModeCommand
];

module.exports = {
  getCommandType
};

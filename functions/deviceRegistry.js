/**
 * Copyright (c) 2010-2025 Contributors to the openHAB project
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
 * Device Type Registry
 *
 * Centralized registry of all Google Assistant device types supported by openHAB.
 *
 * @author Michael Krug
 */

// Import base device classes
const Switch = require('./devices/switch.js');
const StartStopSwitch = require('./devices/startstopswitch.js');
const OpenCloseDevice = require('./devices/openclosedevice.js');
const Fan = require('./devices/fan.js');

// Import complex device implementations
const ACUnit = require('./devices/acunit.js');
const Camera = require('./devices/camera.js');
const Charger = require('./devices/charger.js');
const ClimateSensor = require('./devices/climatesensor.js');
const ColorLight = require('./devices/colorlight.js');
const DimmableLight = require('./devices/dimmablelight.js');
const DynamicModesDevice = require('./devices/dynamicmodesdevice.js');
const DynamicModesLight = require('./devices/dynamicmodeslight.js');
const HumiditySensor = require('./devices/humiditysensor.js');
const Lock = require('./devices/lock.js');
const ModesDevice = require('./devices/modesdevice.js');
const ModesLight = require('./devices/modeslight.js');
const Scene = require('./devices/scene.js');
const SecuritySystem = require('./devices/securitysystem.js');
const SimpleSecuritySystem = require('./devices/simplesecuritysystem.js');
const Sensor = require('./devices/sensor.js');
const Speaker = require('./devices/speaker.js');
const SpecialColorLight = require('./devices/specialcolorlight.js');
const TemperatureSensor = require('./devices/temperaturesensor.js');
const Thermostat = require('./devices/thermostat.js');
const TV = require('./devices/tv.js');
const Valve = require('./devices/valve.js');

/**
 * Factory function to create device type variants from a base class.
 *
 * @param {class} baseClass - The base device class to extend
 * @param {string} type - The Google Assistant device type (e.g., 'OUTLET', 'LIGHT')
 * @param {string} name - The class name for debugging purposes
 * @returns {class} A new class extending baseClass with the specified type
 */
function createDeviceVariant(baseClass, type, name) {
  return class extends baseClass {
    static get type() {
      return `action.devices.types.${type}`;
    }
    static get name() {
      return name;
    }
  };
}

/**
 * Helper to create multiple device variants from the same base class.
 *
 * @param {class} baseClass - The base device class to extend
 * @param {Array<object>} configs - Array of {type, name} configurations
 * @returns {Array<class>} Array of device classes
 */
function createDeviceVariants(baseClass, configs) {
  return configs.map(({ type, name }) => createDeviceVariant(baseClass, type, name));
}

/**
 * Complete device registry.
 * Order matters: more specific devices should come before more general ones
 * to ensure correct device type matching.
 */
const DEVICE_REGISTRY = [
  // Complex devices with custom logic (must come first for proper matching)
  ACUnit,
  Camera,
  Charger,
  ClimateSensor,
  ColorLight,
  DimmableLight,
  DynamicModesDevice,
  DynamicModesLight,
  Fan,
  HumiditySensor,
  Lock,
  ModesDevice,
  ModesLight,
  Scene,
  SecuritySystem,
  SimpleSecuritySystem,
  Sensor,
  Speaker,
  SpecialColorLight,
  TemperatureSensor,
  Thermostat,
  TV,
  Valve,

  // Base classes (provide fallback matching)
  Switch,

  // Simple device type variants - Switch-based devices
  ...createDeviceVariants(Switch, [
    { type: 'OUTLET', name: 'Outlet' },
    { type: 'FAN', name: 'SimpleFan' },
    { type: 'LIGHT', name: 'SimpleLight' },
    { type: 'FIREPLACE', name: 'Fireplace' },
    { type: 'COFFEE_MAKER', name: 'CoffeeMaker' },
    { type: 'WATERHEATER', name: 'WaterHeater' }
  ]),

  // Simple device type variants - Fan-based devices
  ...createDeviceVariants(Fan, [
    { type: 'AIRPURIFIER', name: 'AirPurifier' },
    { type: 'HOOD', name: 'Hood' }
  ]),

  // Simple device type variants - StartStopSwitch-based devices
  ...createDeviceVariants(StartStopSwitch, [
    { type: 'VACUUM', name: 'Vacuum' },
    { type: 'WASHER', name: 'Washer' },
    { type: 'DISHWASHER', name: 'Dishwasher' },
    { type: 'SPRINKLER', name: 'Sprinkler' }
  ]),

  // Simple device type variants - OpenCloseDevice-based devices
  ...createDeviceVariants(OpenCloseDevice, [
    { type: 'DOOR', name: 'Door' },
    { type: 'GATE', name: 'Gate' },
    { type: 'AWNING', name: 'Awning' },
    { type: 'PERGOLA', name: 'Pergola' },
    { type: 'GARAGE', name: 'Garage' },
    { type: 'WINDOW', name: 'Window' },
    { type: 'BLINDS', name: 'Blinds' },
    { type: 'CURTAIN', name: 'Curtain' },
    { type: 'SHUTTER', name: 'Shutter' }
  ])
];

module.exports = {
  DEVICE_REGISTRY
};

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
 * Google Smart Home API Error Codes
 * Reference: https://developers.home.google.com/cloud-to-cloud/send-errors-to-google
 *
 * @author Michael Krug
 */

const ERROR_CODES = {
  // Device state errors
  DEVICE_OFFLINE: 'deviceOffline',
  OFFLINE: 'offline', // Alias for deviceOffline
  DEVICE_NOT_FOUND: 'deviceNotFound',
  DEVICE_NOT_READY: 'deviceNotReady',

  // Command/parameter errors
  VALUE_OUT_OF_RANGE: 'valueOutOfRange',
  NOT_SUPPORTED: 'notSupported',
  FUNCTION_NOT_SUPPORTED: 'functionNotSupported',

  // State-specific errors
  ALREADY_ON: 'alreadyOn',
  ALREADY_OFF: 'alreadyOff',
  ALREADY_OPEN: 'alreadyOpen',
  ALREADY_CLOSED: 'alreadyClosed',
  ALREADY_LOCKED: 'alreadyLocked',
  ALREADY_UNLOCKED: 'alreadyUnlocked',
  ALREADY_STARTED: 'alreadyStarted',
  ALREADY_STOPPED: 'alreadyStopped',
  ALREADY_ARMED: 'alreadyArmed',
  ALREADY_DISARMED: 'alreadyDisarmed',
  ALREADY_IN_STATE: 'alreadyInState',
  ALREADY_DOCKED: 'alreadyDocked',
  TARGET_ALREADY_REACHED: 'targetAlreadyReached',

  // Volume trait-specific errors (from Volume trait documentation)
  VOLUME_ALREADY_MAX: 'volumeAlreadyMax',
  VOLUME_ALREADY_MIN: 'volumeAlreadyMin',

  // FanSpeed trait-specific errors (from FanSpeed trait documentation)
  MAX_SPEED_REACHED: 'maxSpeedReached',
  MIN_SPEED_REACHED: 'minSpeedReached',

  // TemperatureSetting trait-specific errors (from TemperatureSetting trait documentation)
  ALREADY_AT_MAX: 'alreadyAtMax',
  ALREADY_AT_MIN: 'alreadyAtMin',
  IN_AUTO_MODE: 'inAutoMode',
  IN_AWAY_MODE: 'inAwayMode',
  IN_DRY_MODE: 'inDryMode',
  IN_ECO_MODE: 'inEcoMode',
  IN_FAN_ONLY_MODE: 'inFanOnlyMode',
  IN_HEAT_OR_COOL: 'inHeatOrCool',
  IN_HUMIDIFIER_MODE: 'inHumidifierMode',
  IN_OFF_MODE: 'inOffMode',
  IN_PURIFIER_MODE: 'inPurifierMode',
  LOCKED_TO_RANGE: 'lockedToRange',
  RANGE_TOO_CLOSE: 'rangeTooClose',

  // General setting range errors
  MAX_SETTING_REACHED: 'maxSettingReached',
  MIN_SETTING_REACHED: 'minSettingReached',

  // Command-specific errors
  ARM_FAILURE: 'armFailure',
  DISARM_FAILURE: 'disarmFailure',
  NO_AVAILABLE_APP: 'noAvailableApp',
  NO_AVAILABLE_CHANNEL: 'noAvailableChannel',

  // Authorization errors
  AUTH_EXPIRED: 'authExpired',
  CHALLENGE_NEEDED: 'challengeNeeded',

  // Generic fallback
  ACTION_NOT_AVAILABLE: 'actionNotAvailable'
};

// Challenge type constants for authorization flows
const CHALLENGE_TYPES = {
  PIN_NEEDED: 'pinNeeded',
  CHALLENGE_FAILED_PIN_NEEDED: 'challengeFailedPinNeeded',
  ACK_NEEDED: 'ackNeeded'
};

// StatusReport codes for action.devices.traits.StatusReport exceptions
const STATUS_REPORT_CODES = {
  BAG_FULL: 'bagFull',
  BIN_FULL: 'binFull',
  CARBON_MONOXIDE_DETECTED: 'carbonMonoxideDetected',
  DEVICE_AT_EXTREME_TEMPERATURE: 'deviceAtExtremeTemperature',
  DEVICE_JAMMING_DETECTED: 'deviceJammingDetected',
  DEVICE_MOVED: 'deviceMoved',
  DEVICE_OPEN: 'deviceOpen',
  DEVICE_TAMPERED: 'deviceTampered',
  DEVICE_UNPLUGGED: 'deviceUnplugged',
  FLOOR_UNREACHABLE: 'floorUnreachable',
  HARDWARE_FAILURE: 'hardwareFailure',
  IN_SOFTWARE_UPDATE: 'inSoftwareUpdate',
  IS_BYPASSED: 'isBypassed',
  LOW_BATTERY: 'lowBattery',
  MOTION_DETECTED: 'motionDetected',
  NEEDS_PADS: 'needsPads',
  NEEDS_SOFTWARE_UPDATE: 'needsSoftwareUpdate',
  NEEDS_WATER: 'needsWater',
  NETWORK_JAMMING_DETECTED: 'networkJammingDetected',
  NO_ISSUES_REPORTED: 'noIssuesReported',
  ROOMS_ON_DIFFERENT_FLOORS: 'roomsOnDifferentFloors',
  RUN_CYCLE_FINISHED: 'runCycleFinished',
  SECURITY_RESTRICTION: 'securityRestriction',
  SMOKE_DETECTED: 'smokeDetected',
  TANK_EMPTY: 'tankEmpty',
  USING_CELLULAR_BACKUP: 'usingCellularBackup',
  WATER_LEAK_DETECTED: 'waterLeakDetected'
};

const VALID_STATUS_REPORT_CODES = new Set(Object.values(STATUS_REPORT_CODES));

/**
 * Custom error class for Google Assistant errors.
 * Extends Error to include Google Smart Home error properties.
 */
class GoogleAssistantError extends Error {
  /**
   * @param {string} errorCode - Google error code (from ERROR_CODES)
   * @param {string} message - Human-readable error message (used for both Error message and debugString in response)
   * @param {object} options - Additional options (statusCode, challengeNeeded, etc.)
   */
  constructor(errorCode, message = '', options = {}) {
    super(message || errorCode);
    this.name = 'GoogleAssistantError';
    this.errorCode = errorCode;
    this.statusCode = options.statusCode || 400;
    if (message) {
      this.debugString = message;
    }
    if (options.challengeNeeded) {
      this.challengeNeeded = options.challengeNeeded;
    }
    Object.setPrototypeOf(this, GoogleAssistantError.prototype);
  }
}

module.exports = {
  ERROR_CODES,
  CHALLENGE_TYPES,
  STATUS_REPORT_CODES,
  VALID_STATUS_REPORT_CODES,
  GoogleAssistantError
};

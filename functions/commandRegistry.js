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
 * Command Registry
 *
 * Centralized registry of all Google Assistant commands supported by openHAB.
 *
 * @author Michael Krug
 */

const COMMAND_REGISTRY = [
  require('./commands/activatescene.js'),
  require('./commands/appselect.js'),
  require('./commands/armdisarm.js'),
  require('./commands/brightnessabsolute.js'),
  require('./commands/charge.js'),
  require('./commands/colorabsolute.js'),
  require('./commands/colorabsolutetemperature.js'),
  require('./commands/dock.js'),
  require('./commands/getcamerastream.js'),
  require('./commands/locate.js'),
  require('./commands/lockunlock.js'),
  require('./commands/medianext.js'),
  require('./commands/mediapause.js'),
  require('./commands/mediaprevious.js'),
  require('./commands/mediaresume.js'),
  require('./commands/mute.js'),
  require('./commands/onoff.js'),
  require('./commands/openclose.js'),
  require('./commands/rotateabsolute.js'),
  require('./commands/selectchannel.js'),
  require('./commands/setfanspeed.js'),
  require('./commands/sethumidity.js'),
  require('./commands/setinput.js'),
  require('./commands/setmodes.js'),
  require('./commands/setvolume.js'),
  require('./commands/startstop.js'),
  require('./commands/thermostatsetmode.js'),
  require('./commands/thermostattemperaturesetpoint.js'),
  require('./commands/thermostattemperaturesetpointhigh.js'),
  require('./commands/thermostattemperaturesetpointlow.js'),
  require('./commands/volumerelative.js')
];

module.exports = {
  COMMAND_REGISTRY
};

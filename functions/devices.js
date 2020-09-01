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

const glob = require('glob');

const Devices = [];

glob.sync('./devices/*.js', { cwd: __dirname }).forEach(file => {
  const device = require(file);
  if (device.type) {
    Devices.push(device);
  }
});

module.exports = {
  getDeviceForItem: (item = {}) => {
    return Devices.find((device) => device.matchesItemType(item) && device.isCompatible(item));
  }
};

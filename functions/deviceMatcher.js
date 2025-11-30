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
 * Device Matching Logic
 *
 * Finds the appropriate device type for an openHAB item.
 *
 * @author Michael Krug
 */

const { DEVICE_REGISTRY } = require('./deviceRegistry.js');

module.exports = {
  /**
   * Find the appropriate device type for an openHAB item.
   *
   * @param {object} item - The openHAB item with metadata
   * @returns {class|undefined} The matching device type class, or undefined if no match
   */
  findDeviceType: (item) => {
    return (
      item.metadata &&
      item.metadata.ga &&
      DEVICE_REGISTRY.find((device) => device.matchesItemType(item) && device.matchesDeviceType(item))
    );
  }
};

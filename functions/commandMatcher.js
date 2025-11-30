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
 * Command Matcher
 *
 * Discovers and matches Google Assistant commands to their handlers.
 *
 * @author Michael Krug
 */

const { COMMAND_REGISTRY } = require('./commandRegistry.js');

module.exports = {
  /**
   * Find the appropriate command handler for a Google Assistant command.
   *
   * @param {string} command - The command type string
   * @param {object} params - The command parameters to validate
   * @returns {object|undefined} The matching command handler, or undefined if no match
   */
  findCommandHandler: (command, params) => {
    return COMMAND_REGISTRY.find(
      (commandHandler) => command === commandHandler.type && commandHandler.validateParams(params)
    );
  }
};

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

const fs = require('fs');
const path = require('path');

const Commands = [];

// Load all command handlers from the commands directory
fs.readdirSync(path.join(__dirname, 'commands')).forEach((file) => {
  if (file === 'index.js' || !file.endsWith('.js')) return;
  const command = require(`./commands/${file}`);
  if (command.type) {
    Commands.push(command);
  }
});

module.exports = {
  /**
   * Find the appropriate command handler for a Google Assistant command.
   *
   * @param {string} command - The command type string
   * @param {object} params - The command parameters to validate
   * @returns {object|undefined} The matching command handler, or undefined if no match
   */
  findCommandHandler: (command, params) => {
    return Commands.find((commandHandler) => command === commandHandler.type && commandHandler.validateParams(params));
  }
};

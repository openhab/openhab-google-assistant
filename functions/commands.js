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

const glob = require('glob');

const Commands = [];

glob.sync('./commands/*.js', { cwd: __dirname }).forEach(file => {
  const command = require(file);
  if (command.type) {
    Commands.push(command);
  }
});

module.exports = {
  getCommandType: (command = '', params = {}) => {
    return Commands.find((commandType) => command === commandType.type && commandType.validateParams(params));
  }
};

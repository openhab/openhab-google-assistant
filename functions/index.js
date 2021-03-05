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
 * Main entry point for incoming intents from Google Assistant.
 *
 * @author Mehmet Arziman - Initial contribution
 * @author Michael Krug - Rework
 *
 */
const OpenHAB = require('./openhab.js');
const ApiHandler = require('./apihandler.js');
const config = require('./config.js');
const app = require('actions-on-google').smarthome();

const apiHandler = new ApiHandler(config);
const openHAB = new OpenHAB(apiHandler);

app.onDisconnect(() => openHAB.onDisconnect());
app.onExecute((body, headers) => openHAB.onExecute(body, headers));
app.onQuery((body, headers) => openHAB.onQuery(body, headers));
app.onSync((body, headers) => openHAB.onSync(body, headers));

exports.openhabGoogleAssistant = app;

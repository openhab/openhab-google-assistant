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
const OpenHAB = require('./openhab.js').OpenHAB;
const ApiHandler = require('./apihandler.js').ApiHandler;
const config = require('./config.js');
const app = require('actions-on-google').smarthome();

app.onDisconnect(() => {
	return {};
});

app.onExecute(async (body, headers) => {
	const authToken = headers.authorization ? headers.authorization.split(' ')[1] : null;
	const apiHandler = new ApiHandler(config, authToken);
	const payload = await new OpenHAB(apiHandler).handleExecute(body.inputs[0].payload.commands).catch(() => ({
		errorCode: 'actionNotAvailable',
		status: 'ERROR',
		commands: []
	}));

	return {
		requestId: body.requestId,
		payload: payload
	};
});

app.onQuery(async (body, headers) => {
	const authToken = headers.authorization ? headers.authorization.split(' ')[1] : null;
	const apiHandler = new ApiHandler(config, authToken);
	const payload = await new OpenHAB(apiHandler).handleQuery(body.inputs[0].payload.devices).catch(() => ({
		errorCode: 'actionNotAvailable',
		status: 'ERROR',
		devices: {}
	}));

	return {
		requestId: body.requestId,
		payload: payload
	};
});

app.onSync(async (body, headers) => {
	const authToken = headers.authorization ? headers.authorization.split(' ')[1] : null;
	const apiHandler = new ApiHandler(config, authToken);
	const payload = await new OpenHAB(apiHandler).handleSync().catch(() => ({
		errorCode: 'actionNotAvailable',
		status : 'ERROR'
	}));

	return {
		requestId: body.requestId,
		payload: payload
	};
});

exports.openhabGoogleAssistant = app;

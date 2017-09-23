/**
 * Copyright (c) 2014-2016 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */

/**
 * Main entry point for incoming intents from Google Assistant.
 *
 * @author Mehmet Arziman - Initial contribution
 *
 */
'use strict';

const openhab = require('./openhab.js');
const color = require('colr');

exports.openhabGoogleAssistant = function(request, response) {
	let authToken = request.headers.authorization ? request.headers.authorization.split(' ')[1] : null;
	console.log("openhabGoogleAssistant: Cloud function called:" + JSON.stringify(request.body));

	let requestBody = request.body;    
	if (!requestBody.inputs) {
		showError(response, "openhabGoogleAssistant: Missing inputs");
		return;
	}

	for (let i = 0; i < requestBody.inputs.length; i++) {
		let input = requestBody.inputs[i];
		let intent = input.intent || "";
		switch (intent) {
		case "action.devices.SYNC":
			openhab.handleSync(request, response);
			return;
		case "action.devices.QUERY":
		case "action.devices.EXECUTE":
			openhab.handleQueryAndExecute(request, response);
			return;
		}
	}
	showError(response, "openhabGoogleAssistant: Missing intent");
}



function showError(res, message) {
	res.status(401).set({
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization'
	}).json({error: message});
}


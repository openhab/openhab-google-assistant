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
 * openHAB REST API handler for requests towards the openHAB REST API,
 * adapted from the opanHAB Alexa Skill
 * 
 * @author Mehmet Arziman - Initial contribution
 * @author Dan Cunningham - Foundations
 *
 */
const https = require('https');
const config = require('./config.js');

/**
 * Returns all items
 */
function getItems(token, success, failure) {
	return getItem(token, null, success, failure);
}

/**
 * Returns a single item
 */
function getItem(token, itemName, success, failure) {
	let options = httpItemOptions(token, itemName);
	https.get(options, function (response) {
		let body = '';

		response.on('data', function (data) {
			body += data.toString('utf-8');
		});

		response.on('end', function () {
			if (response.statusCode != 200) {
				console.error('getItem failed for path: ' + options.path +
						' code: ' + response.statusCode +
						' body: ' + body);
				failure({
					message: 'Error response ' + response.statusCode
				});
				return;
			}
			let resp = JSON.parse(body);
			success(resp);
		});

		response.on('error', function (e) {
			failure(e);
		});
	})
	.end();
}

/**
 * POST a command to a item
 **/
function postItemCommand(token, itemName, value, success, failure) {
	let options = httpItemOptions(token, itemName, 'POST', value.length);
	let req = https.request(options, function (response) {
		if (response.statusCode === 200 || response.statusCode === 201) {
			success(response);
		} else {
			failure({
				message: 'Error response ' + response.statusCode
			});
		}
		response.on('error', function (e) {
			failure(e);
		});
	});

	req.write(value);
	req.end();
}

/**
 * Returns a HTTP option object suitable for item commands
 */
function httpItemOptions(token, itemname, method, length) {
	let options = {
			hostname: config.host,
			port: config.port,
			path: config.path + (itemname || ''),
			method: method || 'GET',
			headers: {}
	};

	if (config.userpass) {
		options.auth = config.userpass;
	} else {
		options.headers['Authorization'] = 'Bearer ' + token;
	}

	if (method === 'POST' || method === 'PUT') {
		options.headers['Content-Type'] = 'text/plain';
		options.headers['Content-Length'] = length;
	}
	return options;
}

module.exports = {
	getItems,
	getItem,
	postItemCommand
}

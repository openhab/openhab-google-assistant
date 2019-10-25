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
 * openHAB handler for incoming intents from Google Assistant platform,
 * based on the approach of the opanHAB Alexa Skill
 *
 * @author Mehmet Arziman - Initial contribution
 * @author Dan Cunningham - Foundations
 *
 */
const rest = require('./rest.js');
const utils = require('./utils.js');
const colr = require('colr');

exports.handleDisconnect = function (request, response) {
	response.status(200).json({}); // 200 Ok with an empty JSON body is all that is needed
}

exports.handleSync = function (request, response) {
	const authToken = request.headers.authorization ? request.headers.authorization.split(' ')[1] : null;
	// Creating the final SYNC response back to Google Assistant platform.
	// This will include all the device types and traits.
	const success = function (devs) {
		// The response payload will be an array of discovered devices with attributes and traits.
		const payload = {
			devices: devs
		};
		generateResponse('SYNC', request.body.requestId, payload, response);
	};

	const failure = function (error) {
		generateError('syncAndDiscoverDevices', error, response);
	};

	// Creating the final SYNC response back to Google Assistant platform.
	// This will include all the device types and traits.
	syncAndDiscoverDevices(authToken, success, failure);
}

exports.handleQuery = function (request, response) {
	const authToken = request.headers.authorization ? request.headers.authorization.split(' ')[1] : null;
	const devices = request.body.inputs[0].payload.devices;

	console.log('openhabGoogleAssistant - getItemsState devices:' + JSON.stringify(devices));

	// Wrap async call in promise
	const getItemAsync = function (token, deviceId) {
		return new Promise((success, failure) => rest.getItem(token, deviceId, success, failure));
	}

	// Get status for all devices, and return array of promises... one for each device.
	const promises = devices.map((device) => {
		return getItemAsync(authToken, device.id).then((res) => { // success
			console.log('result for ' + device.id + ': ' + JSON.stringify(res))

			// device is always marked as online / available
			const retValue = {
				id: device.id,
				data: {
					online: true
				}
			};

			let itemData = {};
			// get the data from the device
			switch (res.type) {
				case 'Switch':
					if (utils.itemHasTag(res, 'Lock')) {
						itemData = utils.getLockData(res);
					} else {
						itemData = utils.getSwitchData(res);
					}
					break;
				case 'Scene':
				case 'Outlet':
					itemData = utils.getSwitchData(res);
					break;
				case 'Group':
					// future proof in case Groups are used for other invocations
					if (utils.itemHasTag(res, 'Thermostat')) {
						itemData = getTempData(res);
					}
					break;
				case 'Dimmer':
					itemData = utils.getLightData(res);
					break;
				case 'Color':
					itemData = utils.getColorData(res);
					break;
				case 'Rollershutter':
					itemData = utils.getRollerShutterData(res);
					break;
				default:
					if (utils.itemHasTag(res, 'CurrentTemperature')) {
						itemData = getTempData(res);
					}
					break;
			}

			// find out, which data needs to be delivered to google
			const traits = getSwitchableTraits(res);
			for (let i = 0; i < traits.length; i++) {
				switch (traits[i]) {
					case 'action.devices.traits.OnOff':
						retValue.data.on = itemData.on;
						break;
					case 'action.devices.traits.Scene':
						// Scenes are stateless in google home graph
						break;
					case 'action.devices.traits.Brightness':
						retValue.data.brightness = itemData.brightness;
						break;
					case 'action.devices.traits.ColorSpectrum':
						retValue.data.color = itemData.color;
						break;
					case 'action.devices.traits.TemperatureSetting':
						retValue.data.thermostatMode = itemData.thermostatMode;
						retValue.data.thermostatTemperatureAmbient = itemData.thermostatTemperatureAmbient;
						retValue.data.thermostatTemperatureSetpoint = itemData.thermostatTemperatureSetpoint;
						retValue.data.thermostatHumidityAmbient = itemData.thermostatHumidityAmbient;
						break;
					case 'action.devices.traits.OpenClose':
						retValue.data.openPercent = itemData.openPercent;
						break;
					case 'action.devices.traits.LockUnlock':
						retValue.data.isLocked = itemData.isLocked;
						break;
				}
			}
			return retValue;
		}, () => ({
			id: device.id,
			data: {
				online: false
			}
		}));
	});

	// Wait for all requests to complete ...
	Promise.all(promises)
		.then(res => { 		// ... and process the results.
			console.log('Got all results: ' + JSON.stringify(res))
			const payload = {
				devices: {}
			};
			for (var i = 0; i < res.length; i++) {
				payload.devices[res[i].id] = res[i].data;
			}
			generateResponse('getItemsState', request.body.requestId, payload, response);
		}).catch((error) => {
			generateError('getItemsState', error, response);
		});
}

exports.handleExecute = function (request, response) {
	const authToken = request.headers.authorization ? request.headers.authorization.split(' ')[1] : null;
	const requestId = request.body.requestId;

	const requestCommands = request.body.inputs[0].payload.commands;

	for (let i = 0; i < requestCommands.length; i++) {
		const currentCommand = requestCommands[i];

		for (let j = 0; j < currentCommand.execution.length; j++) {
			const currentExecutionCommand = currentCommand.execution[j];
			const params = currentExecutionCommand.params;

			switch (currentExecutionCommand.command) {
				case 'action.devices.commands.OnOff':
					turnOnOff(requestId, currentCommand, params, authToken, response);
					break;
				case 'action.devices.commands.BrightnessAbsolute':
					adjustBrightness(requestId, currentCommand, params, authToken, response);
					break;
				case 'action.devices.commands.ChangeColor':
				case 'action.devices.commands.ColorAbsolute':
					adjustColor(requestId, currentCommand, params, authToken, response);
					break;
				case 'action.devices.commands.ActivateScene':
					adjustScene(requestId, currentCommand, params, authToken, response);
					break;
				case 'action.devices.commands.OpenClose':
					changeOpenClose(requestId, currentCommand, params, authToken, response);
					break;
				case 'action.devices.commands.StartStop':
					changeStartStop(requestId, currentCommand, params, authToken, response);
					break;
				case 'action.devices.commands.LockUnlock':
					changeLockUnlock(requestId, currentCommand, params, authToken, response);
					break;
				case 'action.devices.commands.ThermostatTemperatureSetpoint':
					adjustThermostatTemperature(request, response, i, j);
					break;
				case 'action.devices.commands.ThermostatSetMode':
					adjustThermostatMode(request, response, i, j);
					break;
			}
		}
	}
}

function generateResponse(action, requestId, payload, response) {
	const result = {
		requestId: requestId,
		payload: payload
	};
	console.log(`openhabGoogleAssistant - ${action} result: ${JSON.stringify(result)}`);
	response.status(200).json(result);
}

function generateError(action, error, response) {
	console.error(`openhabGoogleAssistant - ${action} failed: ${error.message}`);
	response.status(500).set({
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization'
	}).json({ error: 'failed' });
}

/**
 * Gets Temperature or Thermostat Data
 */
function getTempData(item) {
	let thermData = {};
	const thermItems = utils.itemHasTag(item, 'Thermostat') ? getThermostatItems(item.members) : getThermostatItems([item]);

	// Are we dealing with Fahrenheit?
	const isF = utils.itemHasTag(item, 'Fahrenheit');

	// store long json variables in easier variables to work with below
	const tstatMode = thermItems.hasOwnProperty('heatingCoolingMode') ? utils.normalizeThermostatMode(thermItems.heatingCoolingMode.state) : 'heat'
	const currTemp = thermItems.hasOwnProperty('currentTemperature') ? (isF ? utils.toC(thermItems.currentTemperature.state) : thermItems.currentTemperature.state) : '';
	const tarTemp = thermItems.hasOwnProperty('targetTemperature') ? (isF ? utils.toC(thermItems.targetTemperature.state) : thermItems.targetTemperature.state) : '';
	const curHum = thermItems.hasOwnProperty('currentHumidity') ? thermItems.currentHumidity.state : '';

	// populate only the necessary json values, otherwise GA will get confused if keys are empty
	if (utils.itemHasTag(item, 'Thermostat')) {
		thermData.thermostatMode = tstatMode;
		if (thermItems.hasOwnProperty('currentTemperature')) thermData.thermostatTemperatureAmbient = Number(parseFloat(currTemp).toFixed(1));
		if (thermItems.hasOwnProperty('targetTemperature')) thermData.thermostatTemperatureSetpoint = Number(parseFloat(tarTemp).toFixed(1));
		if (thermItems.hasOwnProperty('currentHumidity')) thermData.thermostatHumidityAmbient = Number(parseFloat(curHum).toFixed(0));
	}
	else if (utils.itemHasTag(item, 'CurrentTemperature')) {
		thermData.thermostatMode = 'heat'; // doesn't matter, GA will only state the number (since we force Ambient and Setpoint to match)
		if (thermItems.hasOwnProperty('currentTemperature')) thermData.thermostatTemperatureAmbient = Number(parseFloat(currTemp).toFixed(1));
		thermData.thermostatTemperatureSetpoint = thermData.thermostatTemperatureAmbient;
	}

	return thermData;
}

/**
 * Turns a Switch Item on or off
 */
function turnOnOff(requestId, reqCommand, params, authToken, response) {
	console.log('openhabGoogleAssistant - turnOnOff reqCommand:' + JSON.stringify(reqCommand));

	for (let k = 0; k < reqCommand.devices.length; k++) {
		const deviceId = reqCommand.devices[k].id;

		const success = function () {
			const payload = {
				commands: {
					ids: [deviceId],
					status: 'SUCCESS',
					states: {
						online: true,
						on: params.on
					}
				}
			};
			generateResponse('turnOnOff', requestId, payload, response);
		};

		const failure = function (error) {
			generateError('turnOnOff', error, response);
		};

		const state = params.on ? 'ON' : 'OFF';
		rest.postItemCommand(authToken, deviceId, state, success, failure);
	}
}

/**
 * Change a Item open or close
 */
function changeOpenClose(requestId, reqCommand, params, authToken, response) {
	console.log('openhabGoogleAssistant - turnOpenClose reqCommand:' + JSON.stringify(reqCommand));

	for (let k = 0; k < reqCommand.devices.length; k++) {
		const deviceId = reqCommand.devices[k].id;

		const success = function () {
			const payload = {
				commands: {
					ids: [deviceId],
					status: 'SUCCESS',
					states: {
						online: true,
						openPercent: params.openPercent
					}
				}
			};
			generateResponse('turnOpenClose', requestId, payload, response);
		};

		const failure = function (error) {
			generateError('turnOpenClose', error, response);
		};

		const iState = params.openPercent;
		let state;

		if (iState === 0) {
			state = 'DOWN'
		} else if (iState === 100) {
			state = 'UP'
		} else {
			state = (100 - iState).toString();
		}

		rest.postItemCommand(authToken, deviceId, state, success, failure);
	}
}

/**
 * Change a Item start or stop
 */
function changeStartStop(requestId, reqCommand, params, authToken, response) {
	console.log('openhabGoogleAssistant - turnStartStop reqCommand:' + JSON.stringify(reqCommand));

	for (let k = 0; k < reqCommand.devices.length; k++) {
		const deviceId = reqCommand.devices[k].id;

		const success = function () {
			const payload = {
				commands: {
					ids: [deviceId],
					status: 'SUCCESS',
					states: {
						online: true,
						isRunning: !!params.start,
						isPaused: !!params.pause
					}
				}
			};
			generateResponse('turnStartStop', requestId, payload, response);
		};

		const failure = function (error) {
			generateError('turnStartStop', error, response);
		};

		const state = params.start ? 'MOVE' : 'STOP';
		rest.postItemCommand(authToken, deviceId, state, success, failure);
	}
}


/**
 * Turns a Switch Item on or off
 */
function changeLockUnlock(requestId, reqCommand, params, authToken, response) {
	console.log('openhabGoogleAssistant - changeLockUnlock reqCommand:' + JSON.stringify(reqCommand));

	for (let k = 0; k < reqCommand.devices.length; k++) {
		const deviceId = reqCommand.devices[k].id;

		const success = function () {
			const payload = {
				commands: {
					ids: [deviceId],
					status: 'SUCCESS',
					states: {
						online: true,
						isLocked: params.lock
					}
				}
			};
			generateResponse('changeLockUnlock', requestId, payload, response);
		};

		const failure = function (error) {
			generateError('changeLockUnlock', error, response);
		};

		const state = params.lock ? 'ON' : 'OFF';
		rest.postItemCommand(authToken, deviceId, state, success, failure);
	}
}

/**
 * Brightness control
 */
function adjustBrightness(requestId, reqCommand, params, authToken, response) {
	console.log('openhabGoogleAssistant - adjustBrightness reqCommand:' + JSON.stringify(reqCommand));

	for (let k = 0; k < reqCommand.devices.length; k++) {
		const deviceId = reqCommand.devices[k].id;

		const success = function () {
			const payload = {
				commands: {
					ids: [deviceId],
					status: 'SUCCESS',
					states: {
						online: true,
						brightness: params.brightness
					}
				}
			};
			generateResponse('adjustBrightness', requestId, payload, response);
		};

		const failure = function (error) {
			generateError('adjustBrightness', error, response);
		};

		const state = params.brightness.toString();
		rest.postItemCommand(authToken, deviceId, state, success, failure);
	}
}

/**
 * Color control
 */
function adjustColor(requestId, reqCommand, params, authToken, response) {
	console.log('openhabGoogleAssistant - adjustColor reqCommand:' + JSON.stringify(reqCommand));

	for (let k = 0; k < reqCommand.devices.length; k++) {
		const deviceId = reqCommand.devices[k].id;

		const success = function () {
			const payload = {
				commands: {
					ids: [deviceId],
					status: 'SUCCESS',
					states: {
						online: true,
						color: {
							spectrumRgb: params.color.spectrumRGB
						}
					}
				}
			};
			generateResponse('adjustColor', requestId, payload, response);
		};

		const failure = function (error) {
			generateError('adjustColor', error, response);
		};

		const red = Math.floor(params.color.spectrumRGB / (256 * 256));
		const green = Math.floor((params.color.spectrumRGB % (256 * 256)) / 256);
		const blue = params.color.spectrumRGB % 256;
		const rgbColor = colr.fromRgb(red, green, blue);
		console.log('openhabGoogleAssistant - adjustColor rgbColor:' + rgbColor);
		const state = rgbColor.toHsvArray();
		console.log('openhabGoogleAssistant - adjustColor state:' + state);
		rest.postItemCommand(authToken, deviceId, state.toString(), success, failure);
	}

}

/**
 * Turns a Scene Item on or off
 */
function adjustScene(requestId, reqCommand, params, authToken, response) {
	console.log('openhabGoogleAssistant - adjustScene reqCommand:' + JSON.stringify(reqCommand));

	for (let k = 0; k < reqCommand.devices.length; k++) {
		const deviceId = reqCommand.devices[k].id;

		const success = function () {
			const payload = {
				commands: {
					ids: [deviceId],
					status: 'SUCCESS',
					states: {
						// Note -- scenes are stateless.
					}
				}
			};
			generateResponse('adjustScene', requestId, payload, response);
		};

		const failure = function (error) {
			generateError('asjustScene', error, response);
		};

		const state = params.deactivate ? 'OFF' : 'ON';
		rest.postItemCommand(authToken, deviceId, state, success, failure);
	}
}

/**
 * Adjust a thermostat's temperature by first reading its current values
 **/
function adjustThermostatTemperature(request, response, i, j) {
	const authToken = request.headers.authorization ? request.headers.authorization.split(' ')[1] : null;
	const reqCommand = request.body.inputs[0].payload.commands[i];
	const params = reqCommand.execution[j].params;

	console.log('openhabGoogleAssistant - adjustThermostatTemperature reqCommand:' + JSON.stringify(reqCommand));

	for (let k = 0; k < reqCommand.devices.length; k++) {
		const deviceId = reqCommand.devices[k].id;

		const success = function (resp) {
			const items = getThermostatItems(resp.members);
			const tempUnit = utils.itemHasTag(resp, 'Fahrenheit');
			adjustThermostatTemperatureWithItems(authToken, request, response, params, items.currentTemperature, items.targetTemperature, items.heatingCoolingMode, tempUnit);
		};

		const failure = function (error) {
			generateError('adjustThermostatTemperature', error, response);
		};

		rest.getItem(authToken, deviceId, success, failure);
	}
}

/**
 * Adjust a thermostat's mode by first reading its current values
 **/
function adjustThermostatMode(request, response, i, j) {
	const authToken = request.headers.authorization ? request.headers.authorization.split(' ')[1] : null;
	const reqCommand = request.body.inputs[0].payload.commands[i];
	const params = reqCommand.execution[j].params;

	console.log('openhabGoogleAssistant - adjustThermostatMode reqCommand:' + JSON.stringify(reqCommand));

	for (let k = 0; k < reqCommand.devices.length; k++) {
		const deviceId = reqCommand.devices[k].id;

		const success = function (resp) {
			const items = getThermostatItems(resp.members);
			const tempUnit = utils.itemHasTag(resp, 'Fahrenheit');
			adjustThermostatModeWithItems(authToken, request, response, params, items.currentTemperature, items.targetTemperature, items.heatingCoolingMode, tempUnit);
		};

		const failure = function (error) {
			generateError('adjustThermostatMode', error, response);
		};

		rest.getItem(authToken, deviceId, success, failure);
	}
}


/**
 * Returns a thermostat object based on members of a thermostat tagged group
 **/
function getThermostatItems(thermoGroup) {
	let values = {};
	thermoGroup.forEach(function (member) {
		member.tags.forEach(function (tag) {
			if (tag === 'CurrentTemperature') {
				values.currentTemperature = member;
			}
			if (tag === 'TargetTemperature' || tag === 'homekit:TargetTemperature') {
				values.targetTemperature = member;
			}
			if (tag === 'HeatingCoolingMode' || tag === 'homekit:HeatingCoolingMode' || tag === 'homekit:TargetHeatingCoolingMode' || tag === 'homekit:CurrentHeatingCoolingMode') {
				values.heatingCoolingMode = member;
			}
			if (tag === 'CurrentHumidity') {
				values.currentHumidity = member;
			}
		});
	});
	return values;
}


/**
 * Adjust a thermostat's temperature based on its current actual readings.
 **/
function adjustThermostatTemperatureWithItems(authToken, request, response, params, currentTemperature, targetTemperature, heatingCoolingMode, isF) {
	const reqCommand = request.body.inputs[0].payload.commands[0];
	const deviceId = reqCommand.devices[0].id;
	let curMode;

	if (!targetTemperature) {
		console.error('openhabGoogleAssistant - adjustThermostatTemperatureWithItems failed: targetTemperature not available');
		const payload = {
			commands: {
				ids: [deviceId],
				status: 'ERROR',
				errorCode: 'notSupported'
			}
		};
		generateResponse('adjustThermostatModeWithItems', request.body.requestId, payload, response);
		return;
	}

	const setValue = isF ? utils.toF(params.thermostatTemperatureSetpoint) : params.thermostatTemperatureSetpoint;

	//if heatingCoolingMode has a length of 1 (*should* be number...), then convert to something GA can read (off, heat, cool, on, heatcool)
	if (heatingCoolingMode && heatingCoolingMode.state) {
		curMode = utils.normalizeThermostatMode(heatingCoolingMode.state);
	}

	const success = function () {
		const payload = {
			commands: {
				ids: [deviceId],
				status: 'SUCCESS',
				states: {
					online: true,
					thermostatMode: curMode,
					thermostatTemperatureSetpoint: isF ? utils.toC(setValue) : setValue,
					thermostatTemperatureAmbient: isF ? utils.toC(currentTemperature) : +currentTemperature.state
				}
			}
		};
		generateResponse('adjustThermostatTemperatureWithItems', request.body.requestId, payload, response);
	};

	const failure = function (error) {
		generateError('adjustThermostatTemperatureWithItems', error, response);
	};

	rest.postItemCommand(authToken, targetTemperature.name, setValue.toString(), success, failure);
}


/**
 * Adjust a thermostat's mode based on its current actual readings.
 **/
function adjustThermostatModeWithItems(authToken, request, response, params, currentTemperature, targetTemperature, heatingCoolingMode, isF) {
	const reqCommand = request.body.inputs[0].payload.commands[0];
	const deviceId = reqCommand.devices[0].id;

	if (!heatingCoolingMode) {
		console.error('openhabGoogleAssistant - adjustThermostatModeWithItems failed: heatingCoolingMode not available');
		const payload = {
			commands: {
				ids: [deviceId],
				status: 'ERROR',
				errorCode: 'notSupported'
			}
		};
		generateResponse('adjustThermostatModeWithItems', request.body.requestId, payload, response);
		return;
	}

	let setValue = params.thermostatMode;

	const success = function () {
		const payload = {
			commands: {
				ids: [deviceId],
				status: 'SUCCESS',
				states: {
					online: true,
					thermostatMode: setValue,
					thermostatTemperatureSetpoint: isF ? utils.toC(targetTemperature) : +targetTemperature.state,
					thermostatTemperatureAmbient: isF ? utils.toC(currentTemperature) : +currentTemperature.state
				}
			}
		};
		generateResponse('adjustThermostatModeWithItems', request.body.requestId, payload, response);
	};

	const failure = function (error) {
		generateError('adjustThermostatModeWithItems', error, response);
	};

	setValue = utils.thermostatModeDenormalize(heatingCoolingMode.state, setValue);
	rest.postItemCommand(authToken, heatingCoolingMode.name, setValue.toString(), success, failure);
}


/**
 * Add all devices that have been tagged
 *
 **/
function syncAndDiscoverDevices(token, success, failure) {
	// return true if a value in the first group is contained in the second group
	const matchesGroup = (group1, group2) => (group1.some((e) => group2.includes(e)));

	// Checks for a Fahrenheit tag and sets the righ property on the
	const defaultThermModes = 'off, cool, heat, on, heatcool';

	// attributeDetails response object
	const setTempFormat = function (item, attributeDetails) {
		if (utils.itemHasTag(item, 'Fahrenheit')) {
			attributeDetails.availableThermostatModes = defaultThermModes;
			attributeDetails.thermostatTemperatureUnit = 'F';
		} else {
			attributeDetails.availableThermostatModes = defaultThermModes;
			attributeDetails.thermostatTemperatureUnit = 'C';
		}
	};

	// Callback for successfully retrieving items from rest call
	const getSuccess = function (items) {
		// console.log('openhabGoogleAssistant - syncAndDiscoverDevices getSuccess: ' + JSON.stringify(items));
		let discoveredDevicesList = [];
		let thermostatGroups = [];

		// First retrieve any thermostat Groups
		for (let itemNum in items) {
			const item = items[itemNum];
			if (utils.itemHasTag(item, 'Thermostat') && item.type === 'Group') {
				thermostatGroups.push(item.name);
			}
		}

		// Now retrieve all other items
		for (let itemNum in items) {
			const item = items[itemNum];

			for (let tagNum in item.tags) {
				const tag = item.tags[tagNum];

				// An array of traits that this device supports.
				let traits = null;

				// A special object defined by the partner (openHAB) which will be attached to future QUERY and EXECUTE requests.
				// Partners (openHAB) can use this object to store additional information about the device to improve performance or routing
				// within their cloud, such as the global region of the device.
				//
				// Data in this object has a few constraints:
				// - No Personally Identifiable Information.
				// - Data should change rarely, akin to other attributes -- so this should not contain real-time state.
				// - The total object is limited to 512 bytes per device.
				let customDataDetails = {};
				let attributeDetails = {};

				// The hardware type of device. Current types include:
				//	  action.devices.types.THERMOSTAT
				//	   - Traditional thermostat devices
				//	  action.devices.types.LIGHT
				//	  action.devices.types.OUTLET
				//	  action.devices.types.SWITCH
				//	  action.devices.types.LOCK
				//	  action.devices.types.SCENE
				//	   - This is in essence a locked type as a virtual device it can't be switched by the user to something else.
				let deviceType = '';

				switch (tag) {
					case 'Lighting':
						deviceType = 'action.devices.types.LIGHT';
						traits = getSwitchableTraits(item);
						break;
					case 'Switchable':
						deviceType = 'action.devices.types.SWITCH';
						traits = getSwitchableTraits(item);
						break;
					case 'Lock':
						deviceType = 'action.devices.types.LOCK';
						traits = getSwitchableTraits(item);
						break;
					case 'Scene':
						deviceType = 'action.devices.types.SCENE';
						traits = [
							'action.devices.traits.Scene'
						];
						attributeDetails.sceneReversible = true;
						break;
					case 'Outlet':
						deviceType = 'action.devices.types.OUTLET';
						traits = getSwitchableTraits(item);
						break;
					case 'CurrentTemperature':
						// if this is not part of a thermostatGroup then add it
						// standalone otherwise it will be available as a thermostat
						if (!matchesGroup(thermostatGroups, item.groupNames)) {
							traits = [
								'action.devices.traits.TemperatureSetting'
							];
							setTempFormat(item, attributeDetails);
							deviceType = 'action.devices.types.THERMOSTAT';
						}
						break;
					case 'Thermostat':
						// only group items are allowed to have a Temperature tag
						if (item.type === 'Group') {
							traits = [
								'action.devices.traits.TemperatureSetting'
							];
							setTempFormat(item, attributeDetails);
							deviceType = 'action.devices.types.THERMOSTAT';
						}
						break;
					case 'Blinds':
						deviceType = 'action.devices.types.BLINDS';
						traits = [
							'action.devices.traits.OpenClose',
							'action.devices.traits.StartStop' //only for stop command
						];
						attributeDetails.openDirection = ['UP', 'DOWN'];
						break;
					default:
						break;
				}

				if (traits !== null) {
					console.log('openhabGoogleAssistant - syncAndDiscoverDevices - SYNC is adding: ' + item.name + ' with tag: ' + tag);
					customDataDetails.itemType = item.type;
					customDataDetails.itemTag = tag;
					customDataDetails.openhabVersion = '2.1';

					const discoveredDevice = {
						id: item.name,
						type: deviceType,
						traits: traits,
						name: {
							name: item.label
						},
						willReportState: false,
						attributes: attributeDetails,
						deviceInfo: {
							manufacturer: 'openHAB',
							model: tag,
							hwVersion: '2.1',
							swVersion: '2.1'
						},
						customData: customDataDetails
					};
					discoveredDevicesList.push(discoveredDevice);
				}
			}
		}
		success(discoveredDevicesList);
	};
	rest.getItems(token, getSuccess, failure);
}

/**
 * Given an item, returns an array of traits that are supported.
 **/
function getSwitchableTraits(item) {
	let traits = null;
	if ((item.type === 'Switch' && utils.itemHasTag(item, 'Lock')) || (item.type === 'Group' && item.type === 'Switch' && utils.itemHasTag(item, 'Lock'))) {
		traits = [
			'action.devices.traits.LockUnlock'
		];
	} else if ((utils.itemHasTag(item, 'CurrentTemperature') || (item.type === 'Group' && utils.itemHasTag(item, 'Thermostat')))) {
		traits = [
			'action.devices.traits.TemperatureSetting'
		];
	} else if (item.type === 'Switch' ||
		(item.type === 'Group' && item.groupType && item.groupType === 'Switch')) {
		traits = [
			'action.devices.traits.OnOff'
		];
	} else if (item.type === 'Dimmer' ||
		(item.type === 'Group' && item.groupType && item.groupType === 'Dimmer')) {
		traits = [
			'action.devices.traits.Brightness',
			'action.devices.traits.OnOff'
		];
	} else if (item.type === 'Color' ||
		(item.type === 'Group' && item.groupType && item.groupType === 'Color')) {
		traits = [
			'action.devices.traits.ColorSetting',
			'action.devices.traits.Brightness',
			'action.devices.traits.OnOff'
		];
	} else if (item.type === 'Rollershutter' ||
		(item.type === 'Group' && item.groupType && item.groupType === 'Rollershutter')) {
		traits = [
			//'setPercentage',
			'action.devices.traits.OpenClose'
		];
	}
	return traits;
}

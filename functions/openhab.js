/**
 * Copyright (c) 2014-2016 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */

/**
 * openHAB handler for incoming intents from Google Assistant platform,
 * based on the approach of the opanHAB Alexa Skill
 * 
 * @author Mehmet Arziman - Initial contribution
 * @author Dan Cunningham - Foundations
 *
 */
var rest = require('./rest.js');
var utils = require('./utils.js');
var colr = require('colr');


exports.handleSync = function (request, response) {
	let authToken = request.headers.authorization ? request.headers.authorization.split(' ')[1] : null;

	// Creating the final SYNC response back to Google Assistant platform.
	// This will include all the device types and traits.
	syncAndDiscoverDevices(authToken, function (devs) { 	
		// The response payload will be an array of discovered devices with attributes and traits.
		var payload = {
				devices: devs
		};
		var result = {
				requestId: request.body.requestId,
				payload: payload
		};
		console.log('openhabGoogleAssistant - SYNC result: ' + JSON.stringify(result));
		response.status(200).json(result);
	},
	function (error) {
		console.error("openhabGoogleAssistant - syncAndDiscoverDevices failed: " + error.message);
		response.status(500).set({
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization'
		}).json({error: "failed"});
	});	
}

exports.handleQueryAndExecute = function (request, response) {
	let requestIntent = request.body.inputs[0].intent;
	switch (requestIntent) {
		case 'action.devices.QUERY':
			getItemsState(request,response);
			
			break;
		case 'action.devices.EXECUTE':

			let requestCommands = request.body.inputs[0].payload.commands;

			for (let i = 0; i < requestCommands.length; i++) {
				let currentCommand = requestCommands[i];
				for (let j = 0; j < currentCommand.execution.length; j++) {
					let currentExecutionCommand = currentCommand.execution[j];
		
					switch (currentExecutionCommand.command) {
					case 'action.devices.commands.OnOff':
						turnOnOff(request, response);
						break;
					case 'action.devices.commands.BrightnessAbsolute':
						adjustBrightness(request, response);
						break;
					case 'action.devices.commands.ChangeColor':
					case 'action.devices.commands.ColorAbsolute':
						adjustColor(request, response);
						break;
					case 'action.devices.commands.ThermostatTemperatureSetpoint':
						adjustTemperature(request, response);
						break;
					}
				}
			}	

			break;
		default:
			// TODO: handle error.
			break;
	}

}

/**
 * Returns state for devices in the request 
 */
function getItemsState(request,response) {
	let authToken = request.headers.authorization ? request.headers.authorization.split(' ')[1] : null;
	let devices = request.body.inputs[0].payload.devices;

	console.log('openhabGoogleAssistant - getItemsState devices:' + JSON.stringify(devices));

	// template for result.
	let result = {
		requestId: request.body.requestId,
		payload: {
			devices: {}
		}
	}

	// Wrap async call in promise
	var getItemAsync = function(token, deviceId){		
		return new Promise(function(success,failure){
			rest.getItem(token,deviceId,success,failure);
		});
	}

	// Get status for all devices, and return array of promises... one for each device.
	let promises = devices.map(function(device) {	
		return getItemAsync(authToken, device.id).then(function(res){ // success
			
          	console.log('openhabGoogleAssistant - getItemsState - result for ' + device.id + ': '  + JSON.stringify(res));
          	
          	var data = {};
          
          	switch (res.type) {
			case 'Switch' :
				data = getSwitchData(res);
				break;
			case 'Group' :
				var checkTags = res.tags.toString(); //future proof in case Groups are used for other invocations
				if (checkTags.includes("Thermostat")) data = getTempData(res);
			default:
				var checkTags = res.tags.toString();
				if (checkTags.includes("CurrentTemperature")) data = getTempData(res);
				break;
		}
			return {
				id: device.id,
				data: data
			};
		},function(res){ // failure
			return {
				id: device.id,
				data: {
					online: false
				}
			};
		})
	})

	// Wait for all requests to complete ...
	Promise.all(promises)
		.then(res => { 		// ... and process the results.
			console.log("Got all results: " + JSON.stringify(res));
			for (var i = 0; i < res.length; i++) {
				result.payload.devices[res[i].id] = res[i].data;
			}
			console.log('openhabGoogleAssistant - getItemsState done with result:' + JSON.stringify(result));
			response.status(200).json(result);		
		}).catch(e => {
			console.error("openhabGoogleAssistant - getItemsState failed: " + e.message);
			response.status(500).set({
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization'
			}).json({error: "failed"});			
		})
}

/**
 * Gets Temperature or Thermostat Data
 */
function getTempData(item) {
	var thermData = {};
	var thermItems = item.tags.toString().includes("Thermostat") ? getThermostatItems(item.members) : getThermostatItems([item]);
	
	//Are we dealing with Fahrenheit?
	var isF = item.tags.indexOf('Fahrenheit') >= 0 ? true : false;
	
	//store long json variables in easier variables to work with below
	var tstatMode = thermItems.hasOwnProperty('heatingCoolingMode') ? (thermItems.heatingCoolingMode.state.length == 1 ? utils.normalizeThermostatMode(thermItems.heatingCoolingMode.state) : thermItems.heatingCoolingMode.state) : 'heat'
	var currTemp =  thermItems.hasOwnProperty('currentTemperature') ? (isF ? utils.toC(thermItems.currentTemperature.state) : thermItems.currentTemperature.state) : '';
	var tarTemp = thermItems.hasOwnProperty('targetTemperature') ? (isF ? utils.toC(thermItems.targetTemperature.state) : thermItems.targetTemperature.state) : '';
	var curHum = thermItems.hasOwnProperty('currentHumidity') ? thermItems.currentHumidity.state : '';

	//We will always report device as "online", not sure what this does, but per docs it seems necessary
	thermData.online = true;

	//populate only the necessary json values, otherwise GA will get confused if keys are empty
	if (item.tags.toString().includes("Thermostat")) {
		thermData.thermostatMode = tstatMode;
		if (thermItems.hasOwnProperty('currentTemperature')) thermData.thermostatTemperatureAmbient = Number(parseFloat(currTemp).toFixed(1));
		if (thermItems.hasOwnProperty('targetTemperature')) thermData.thermostatTemperatureSetpoint = Number(parseFloat(tarTemp).toFixed(1));
		if (thermItems.hasOwnProperty('currentHumidity')) thermData.thermostatHumidityAmbient = Number(parseFloat(curHum).toFixed(0));              
	}
	else if (item.tags.toString().includes("CurrentTemperature")) {
		thermData.thermostatMode = "heat"; // doesn't matter, GA will only state the number (since we force Ambient and Setpoint to match)
		if (thermItems.hasOwnProperty('currentTemperature')) thermData.thermostatTemperatureAmbient = Number(parseFloat(currTemp).toFixed(1));
		thermData.thermostatTemperatureSetpoint = thermData.thermostatTemperatureAmbient;
	}
	
	return thermData;
}


function getSwitchData(item) {
  console.log(item.name + " State: " + item.state);
  return {
 		on: item.state === 'ON' ? true : false,
 		online: true
	};
}
          

/**
 * Turns a Switch Item on or off
 */
function turnOnOff(request, response) {
	let authToken = request.headers.authorization ? request.headers.authorization.split(' ')[1] : null;
	let reqCommand = request.body.inputs[0].payload.commands[0];
	let params = reqCommand.execution[0].params;

	console.log('openhabGoogleAssistant - turnOnOff reqCommand:' + JSON.stringify(reqCommand));

	for (let i = 0; i < reqCommand.devices.length; i++) {
		let deviceId = reqCommand.devices[i].id;

		var success = function (resp) {	
			var payload = {};
			let result = {
					requestId: request.body.requestId,
					payload: {
						commands: {
							ids: [ deviceId ], 
							status: "SUCCESS"
						}
					}
			}
			console.log('openhabGoogleAssistant - turnOnOff done with result:' + JSON.stringify(result));
			response.status(200).json(result);
		};

		var failure = function (error) {
			console.error("openhabGoogleAssistant - turnOnOff failed: " + error.message);
			response.status(500).set({
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization'
			}).json({error: "failed"});
		};

		var state = params.on ? 'ON' : 'OFF';
		rest.postItemCommand(authToken, deviceId, state, success, failure);	
	}  
}

/**
 * Brightness control
 */
function adjustBrightness(request, response) {
	let authToken = request.headers.authorization ? request.headers.authorization.split(' ')[1] : null;
	let reqCommand = request.body.inputs[0].payload.commands[0];
	let params = reqCommand.execution[0].params;

	console.log('openhabGoogleAssistant - adjustBrightness reqCommand:' + JSON.stringify(reqCommand));

	for (let i = 0; i < reqCommand.devices.length; i++) {
		let deviceId = reqCommand.devices[i].id;

		var success = function (resp) {
			var payload = {};
			let result = {
					requestId: request.body.requestId,
					payload: {
						commands: {
							ids: [ deviceId ], 
							status: "SUCCESS"
						}
					}
			}
			console.log('openhabGoogleAssistant - adjustBrightness done with result:' + JSON.stringify(result));
			response.status(200).json(result);
		};

		var failure = function (error) {
			console.error("openhabGoogleAssistant - adjustBrightness failed: " + error.message);
			response.status(500).set({
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization'
			}).json({error: "failed"});
		};

		var state = params.brightness.toString();
		rest.postItemCommand(authToken, deviceId, state, success, failure);
	}
}


/**
 * Color control
 */
function adjustColor(request, response) {
	let authToken = request.headers.authorization ? request.headers.authorization.split(' ')[1] : null;
	let reqCommand = request.body.inputs[0].payload.commands[0];
	let params = reqCommand.execution[0].params;

	console.log('openhabGoogleAssistant - adjustColor reqCommand:' + JSON.stringify(reqCommand));

	for (let i = 0; i < reqCommand.devices.length; i++) {
		let deviceId = reqCommand.devices[i].id;

		var success = function (resp) {	
			var payload = {};
			let result = {
					requestId: request.body.requestId,
					payload: {
						commands: {
							ids: [ deviceId ], 
							status: "SUCCESS"
						}
					}
			}
			console.log('openhabGoogleAssistant - adjustColor done with result:' + JSON.stringify(result));
			response.status(200).json(result);
		};

		var failure = function (error) {
			console.error("openhabGoogleAssistant - adjustColor failed: " + error.message);
			response.status(500).set({
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization'
			}).json({error: "failed"});
		};

		let red = Math.floor(params.color.spectrumRGB / (256*256));
		let green = Math.floor((params.color.spectrumRGB % (256*256)) / 256);
		let blue = params.color.spectrumRGB % 256;
		var rgbColor = colr.fromRgb(red, green, blue);
		console.log('openhabGoogleAssistant - adjustColor rgbColor:' + rgbColor);
		var state = rgbColor.toHsvArray();
		console.log('openhabGoogleAssistant - adjustColor state:' + state);
		rest.postItemCommand(authToken, deviceId, state.toString(), success, failure);
	}  

}



/**
 * Adjust a thermostat's temperature by first reading its current values
 **/
function adjustTemperature(request, response) {
	let authToken = request.headers.authorization ? request.headers.authorization.split(' ')[1] : null;
	let reqCommand = request.body.inputs[0].payload.commands[0];
	let params = reqCommand.execution[0].params;
	let deviceId = reqCommand.devices[0].id;
  
	console.log('openhabGoogleAssistant - adjustTemperature reqCommand:' + JSON.stringify(reqCommand));

	var success = function (resp) {
		var items = getThermostatItems(resp.members);
		console.log('openhabGoogleAssistant - adjustTemperature Retrieved Items:' + JSON.stringify(items));
		adjustTemperatureWithItems(authToken, request, response, params, items.currentTemperature, items.targetTemperature, items.heatingCoolingMode, resp.tags[1]);
	};

	var failure = function (error) {
		console.error("openhabGoogleAssistant - adjustTemperature failed: " + error.message);
		response.status(500).set({
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization'
		}).json({error: "failed"});
	};

	rest.getItem(authToken, deviceId, success, failure);
}


/**
 * Rerturns a thermostat object based on memebers of a thermostat tagged group
 **/
function getThermostatItems(thermoGroup) {
	var values = {};
	thermoGroup.forEach(function(member){
		member.tags.forEach(function(tag){
			if (tag === 'CurrentTemperature') {
				values.currentTemperature = member;
			}
			if (tag === 'TargetTemperature') {
				values.targetTemperature = member;
			}
			if (tag === 'homekit:HeatingCoolingMode') {
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
function adjustTemperatureWithItems(authToken, request, response, params, currentTemperature, targetTemperature, heatingCoolingMode, tempUnit) {
	let reqCommand = request.body.inputs[0].payload.commands[0];
	let deviceId = reqCommand.devices[0].id;
	var curMode = "heat";
  
  	if (!targetTemperature) {
		console.error("openhabGoogleAssistant - adjustTemperatureWithItems failed: " + error.message);
		return;
	}
	
  	// Google Assistant needs (like Alexa) everything in Celsius, we will need to respect what a user has set
  	var isF = tempUnit ? (tempUnit.toLowerCase() == 'fahrenheit') : false;
  
	var setValue;
	setValue = isF ? utils.toF(params.thermostatTemperatureSetpoint) : params.thermostatTemperatureSetpoint;

  	//if heatingCoolingMode has a length of 1 (*should* be number...), then convert to something GA can read (off, heat, cool, on, heatcool)
	if(heatingCoolingMode && heatingCoolingMode.state )
		curMode = heatingCoolingMode.state.length == 1 ? utils.normalizeThermostatMode(heatingCoolingMode.state) : heatingCoolingMode.state;

	var success = function (resp) {
		var payload = {};
		let result = {
				requestId: request.body.requestId,
				payload: {
					commands: {
						ids: [ deviceId ], 
						status: "SUCCESS",
						states: {
							"thermostatMode": curMode,
							"thermostatTemperatureSetpoint": isF ? utils.toC(setValue) : setValue
						}
					}
				}
		}
		console.log('openhabGoogleAssistant - adjustTemperatureWithItems done with result:' + JSON.stringify(result));
		response.status(200).json(result);
	};

	var failure = function (error) {
		console.error("openhabGoogleAssistant - adjustTemperatureWithItems failed: " + error.message);
		response.status(500).set({
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization'
		}).json({error: "failed"});
	};

	rest.postItemCommand(authToken, targetTemperature.name, setValue.toString(), success, failure);
}



/**
 * Add all devices that have been tagged
 * 
 **/
function syncAndDiscoverDevices(token, success, failure) {

	//return true if a value in the first group is contained in the second group
	var matchesGroup = function(groups1, groups2){
		for(var num in groups1 ){
			if(groups2.indexOf(groups1[num]) >= 0 )
				return true;
		}
		return false;
	};

	// Checks for a Fahrenheit tag and sets the righ property on the
	// attributeDetails response object
	var setTempFormat = function(item, attributeDetails) {
		if (item.tags.indexOf('Fahrenheit') > -1 || item.tags.indexOf('fahrenheit') > -1) {
			attributeDetails.availableThermostatModes = 'off, cool, heat, on, heatcool';
			attributeDetails.thermostatTemperatureUnit = 'F';
		} else {
			attributeDetails.availableThermostatModes = 'off, cool, heat, on, heatcool';
			attributeDetails.thermostatTemperatureUnit = 'C';
		}
	};

	// Callback for successfully retrieving items from rest call
	var getSuccess = function (items) {
		// console.log('openhabGoogleAssistant - syncAndDiscoverDevices getSuccess: ' + JSON.stringify(items));
		var discoveredDevicesList = [];
		var thermostatGroups = [];

		// First retrieve any thermostat Groups
		(function () {
			for (var itemNum in items) {
				var item = items[itemNum];
				for (var tagNum in item.tags) {
					var tag = item.tags[tagNum];
					if(tag == 'Thermostat' && item.type === 'Group'){
						thermostatGroups.push(item.name);
					}
				}
			}
		})();

		// Now retrieve all other items
		(function () {
			for (var itemNum in items) {
				var item = items[itemNum];
				for (var tagNum in item.tags) {
					var tag = item.tags[tagNum];

					// An array of traits that this device supports.
					var traits = null;


					// A special object defined by the partner (openHAB) which will be attached to future QUERY and EXECUTE requests.
					// Partners (openHAB) can use this object to store additional information about the device to improve performance or routing
					// within their cloud, such as the global region of the device.
					// 
					// Data in this object has a few constraints:
					// - No Personally Identifiable Information.
					// - Data should change rarely, akin to other attributes -- so this should not contain real-time state.
					// - The total object is limited to 512 bytes per device.
					var customDataDetails = {};
					var attributeDetails = {};

					// The hardware type of device. Current types include:
					//	  action.devices.types.THERMOSTAT
					//	   - Traditional thermostat devices
					//	  action.devices.types.LIGHT
					//	  action.devices.types.OUTLET
					//	  action.devices.types.SWITCH
					//	  action.devices.types.SCENE
					//	   - This is in essence a locked type ­­ as a virtual device it can't be switched by the user to something else.
					var deviceTypes = [];

					switch (tag) {

					case 'Lighting':
						deviceTypes = 'action.devices.types.LIGHT';
						traits = getSwitchableTraits(item);
						break;
					case 'Switchable':
						deviceTypes = 'action.devices.types.SWITCH';
						traits = getSwitchableTraits(item);
						break;
					case 'CurrentTemperature':
						//if this is not part of a thermostatGroup then add it
						//standalone otherwise it will be available as a thermostat
						if(!matchesGroup(thermostatGroups, item.groupNames)){
							traits = [
								'action.devices.traits.TemperatureSetting'
								];
                          	deviceTypes = 'action.devices.types.THERMOSTAT';
							setTempFormat(item,attributeDetails);
						}
						break;
					case 'Thermostat':
						//only group items are allowed to have a Temperature tag
						if (item.type === 'Group') {
							traits = [
								'action.devices.traits.TemperatureSetting'
								];
							setTempFormat(item,attributeDetails);
							deviceTypes = 'action.devices.types.THERMOSTAT';
						}
						break;
					default:
						break;
					}
					if (traits !== null) {
						console.log('openhabGoogleAssistant - syncAndDiscoverDevices - SYNC is adding: ' + item.name + ' with tag: ' + tag);
						customDataDetails.itemType = item.type;
						customDataDetails.itemTag = tag;
						customDataDetails.openhabVersion = '2.1';

						var discoveredDevice = {                   
								id: item.name,
								type: deviceTypes,
								traits: traits,
								name: {
									name: item.label
								},
								willReportState: true,
								attributes: attributeDetails,
								deviceInfo: {
									manufacturer: 'openHAB',
									model: tag,  
									hwVersion: "2.1",  
									swVersion: "2.1"  
								},  
								customData: customDataDetails
						};
						discoveredDevicesList.push(discoveredDevice);
					}
				}
			}
		})();
		success(discoveredDevicesList);
	};
	rest.getItems(token, getSuccess, failure);
}

/**
 * Given an item, returns an array of traits that are supported.
 **/
function getSwitchableTraits(item) {
	var traits = null;
	if (item.type === 'Switch' ||
			(item.type === 'Group' && item.groupType && item.groupType === 'Switch')) {
		traits = [
			'action.devices.traits.OnOff'
			];
	} else if (item.type === 'Dimmer' ||
			(item.type === 'Group' && item.groupType && item.groupType === 'Dimmer')) {
		traits = [
			'action.devices.traits.Brightness',
			//'setPercentage',
			'action.devices.traits.OnOff'
			];
	} else if (item.type === 'Color' ||
			(item.type === 'Group' && item.groupType && item.groupType === 'Color')) {
		traits = [
			'action.devices.traits.Brightness',
			//'setPercentage',
			'action.devices.traits.OnOff',
			'action.devices.traits.ColorSpectrum'
			];
	} else if (item.type === 'Rollershutter' ||
			(item.type === 'Group' && item.groupType && item.groupType === 'Rollershutter')) {
		traits = [
			//'setPercentage',
			'action.devices.traits.Brightness'
			];
	}
	return traits;
}

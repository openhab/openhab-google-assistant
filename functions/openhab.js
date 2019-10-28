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
 * openHAB handler for incoming intents from Google Assistant platform
 *
 * @author Mehmet Arziman - Initial contribution
 * @author Dan Cunningham - Foundations
 * @author Michael Krug - Rework
 *
 */
const CommandTypes = require('./commands.js').Commands;
const DeviceTypes = require('./devices.js').Devices;
const Thermostat = require('./devices.js').Thermostat;

class OpenHAB {
	/**
	 * @param {object} apiHandler
	 */
	constructor(apiHandler) {
		this._apiHandler = apiHandler;
	}

	handleSync() {
		console.log('openhabGoogleAssistant - handleSync');
		const matchesGroup = (group1, group2) => (group1.some((e) => group2.includes(e)));
		return this._apiHandler.getItems().then((items) => {
			let discoveredDevicesList = [];
			const thermostatGroups = items.filter((item) => Thermostat.appliesTo(item)).map((item) => item.name);
			items.forEach((item) => {
				const discoveredDevice = {
					id: item.name,
					type: '',
					traits: [],
					name: {
						name: item.label
					},
					willReportState: false,
					attributes: {},
					deviceInfo: {
						manufacturer: 'openHAB',
						model: '',
						hwVersion: '2.4.0',
						swVersion: '2.4.0'
					},
					customData: {
						itemType: item.type,
						itemTag: '',
						openhabVersion: '2.4.0'
					}
				};
				const deviceType = DeviceTypes.find((itemType) => itemType.appliesTo(item) && !matchesGroup(thermostatGroups, item.groupNames));
				if (deviceType) {
					console.log(`openhabGoogleAssistant - handleSync - SYNC is adding: ${item.name} with tags: ${item.tags.join(', ')}`);
					discoveredDevice.type = deviceType.type;
					discoveredDevice.traits = deviceType.traits;
					discoveredDevice.attributes = deviceType.getAttributes(item);
					discoveredDevice.deviceInfo.model = deviceType.tag;
					discoveredDevice.customData.itemTag = deviceType.tag;
					discoveredDevicesList.push(discoveredDevice);
				}
			});
			return { devices: discoveredDevicesList };
		});
	}

	/**
	 * @param {array} devices
	 */
	handleQuery(devices) {
		console.log(`openhabGoogleAssistant - handleQuery - devices: ${JSON.stringify(devices)}`);
		const payload = {
			devices: {}
		};
		const promises = devices.map((device) => {
			return this._apiHandler.getItem(device.id).then((item) => {
				const devicesPayload = {
					id: device.id,
					data: {
						online: true
					}
				};
				DeviceTypes.forEach((device) => {
					if (device.appliesTo(item)) {
						devicesPayload.data = Object.assign(devicesPayload.data, device.getState(item));
					}
				});
				return devicesPayload;
			}).catch((error) => {
				return {
					ids: [device.id],
					status: 'ERROR',
					errorCode: error.statusCode == 404 ? 'deviceNotFound' : error.statusCode == 400 ? 'notSupported' : 'deviceOffline'
				};
			});
		});
		return Promise.all(promises).then((data) => {
			data.forEach((device) => (payload.devices[device.id] = device.data));
			return payload;
		});
	}


	/**
	 * @param {array} commands
	 */
	handleExecute(commands) {
		console.log(`openhabGoogleAssistant - handleExecute - commands: ${JSON.stringify(commands)}`);
		const payload = {
			commands: []
		};
		const promises = [];
		commands.forEach((command) => {
			command.execution.forEach((execution) => {
				const executionParams = execution.params;
				const commandType = CommandTypes.find((commandType) => commandType.appliesTo(execution.command, executionParams));
				if (commandType) {
					promises.push((new commandType(this._apiHandler).execute(command.devices, executionParams)));
				} else {
					promises.push(Promise.resolve(command.devices.map((device) => ({
						ids: [device.id],
						status: 'ERROR',
						errorCode: 'functionNotSupported'
					}))));
				}
			});
		});
		return Promise.all(promises).then((result) => {
			result.forEach((entry) => (payload.commands = payload.commands.concat(entry)));
			return payload;
		});
	}
}

module.exports = { OpenHAB };

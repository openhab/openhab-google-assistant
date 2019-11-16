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
const getCommandType = require('./commands.js').getCommandType;
const getDeviceForItem = require('./devices.js').getDeviceForItem;

class OpenHAB {
	/**
	 * @param {object} apiHandler
	 */
	constructor(apiHandler) {
		this._apiHandler = apiHandler;
		this.openhabVersion = '2.4.0'
	}

	handleSync() {
		console.log('openhabGoogleAssistant - handleSync');
		return this._apiHandler.getItems().then((items) => {
			let discoveredDevicesList = [];
			items.forEach((item) => {
				const DeviceType = getDeviceForItem(item);
				if (DeviceType) {
					console.log(`openhabGoogleAssistant - handleSync - SYNC is adding: ${item.type}:${item.name} with type: ${DeviceType.type}`);
					discoveredDevicesList.push(DeviceType.getMetadata(item));
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
				const DeviceType = getDeviceForItem(item);
				if (!DeviceType) {
					throw { statusCode: 404 };
				}
				if (item.state === 'NULL') {
					throw { statusCode: 406 };
				}
				payload.devices[device.id] = Object.assign({ online: true }, DeviceType.getState(item));
			}).catch((error) => {
				payload.devices[device.id] = {
					status: 'ERROR',
					errorCode: error.statusCode == 404 ? 'deviceNotFound' : error.statusCode == 400 ? 'notSupported' : error.statusCode == 406 ? 'deviceNotReady' : 'deviceOffline'
				};
			});
		});
		return Promise.all(promises).then(() => payload);
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
				const CommandType = getCommandType(execution.command, execution.params);
				if (!CommandType) {
					promises.push(Promise.resolve({
						ids: command.devices.map((device) => device.id),
						status: 'ERROR',
						errorCode: 'functionNotSupported'
					}));
					return;
				}
				promises.push((CommandType.execute(this._apiHandler, command.devices, execution.params, execution.challenge)));
			});
		});
		return Promise.all(promises).then((result) => {
			result.forEach((entry) => (payload.commands = payload.commands.concat(entry)));
			return payload;
		});
	}
}

module.exports = { OpenHAB };

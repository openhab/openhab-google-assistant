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
 * openHAB Utils helper for temperature, color transformations and more,
 * adapted from the opanHAB Alexa Skill
 *
 * @author Mehmet Arziman - Initial contribution
 * @author Dan Cunningham - Foundations
 *
 */


/**
 * Gets Rollershutter Data
 */
function getRollerShutterData(item) {
	return {
		openPercent: 100 - Number(item.state)
	};
}


/**
 *  Retrieves Light Attributes from OpenHAB Item
 **/
function getLightData(item) {
	return {
		on: item.state === 'ON' ? true : (Number(item.state) === 0 ? false : true),
		brightness: Number(item.state)
	};
}

/**
 *  Retrieves Switch Attributes from OpenHAB Item
 **/
function getSwitchData(item) {
	return {
		on: item.state === 'ON' ? true : false,
	};
}

/**
 *  Retrieves Color Attributes from OpenHAB Item
 **/
function getColorData(item) {
	const hsvArray = item.state.split(",").map((val) => Number(val));
	const color = colr.fromHsvArray(hsvArray);
	const rgbColor = parseInt(color.toHex().replace('#', ''), 16);

	return {
		color: {
			"spectrumRGB": rgbColor
		},
		"brightness": hsvArray[2],
		"on": hsvArray[2] === 0 ? false : true,
	};
}

//Convert C to F
function toF(value) {
	return Math.round(value * 9 / 5 + 32);
}

//Convert F to C
function toC(value) {
	return ((value - 32) * 5 / 9).toFixed(2);
}

function generateControlError(messageId, name, code, description) {
	const header = {
		namespace: 'Alexa.ConnectedHome.Control',
		name: name,
		payloadVersion: '2',
		messageId: messageId
	};

	const payload = {
		exception: {
			code: code,
			description: description
		}
	};

	const result = {
		header: header,
		payload: payload
	};

	return result;
}

function thermostatModeIsNumber(mode) {
	return mode.parseInt() !== NaN;
}

// Normilizes numeric/string thermostat modes to Google Assistant friendly ones
function normalizeThermostatMode(mode) {
	// if state returns as a decimal type, convert to string, this is a very common thermo pattern
	let m = mode;
	if (thermostatModeIsNumber(mode)) {
		switch (mode.parseInt()) {
			case 0:
				m = 'off';
				break;
			case 1:
				m = 'heat';
				break;
			case 2:
				m = 'cool';
				break;
			case 3:
				m = 'on';
				break;
			default:
				m = 'off';
				break;
		}
	} else if (mode == 'heat-cool') {
		m = 'heatcool';
	}
	return m.toLowerCase();
}

function thermostatModeDenormalize(oldMode, newMode) {
	let m = newMode;
	if (thermostatModeIsNumber(oldMode)) {
		switch (newMode) {
			case 'off':
				m = 0;
				break;
			case 'heat':
				m = 1;
				break;
			case 'cool':
				m = 2;
				break;
			case 'on':
				m = 3;
				break;
			case 'heat-cool':
			case 'heatcool':
				m = 3;
				break;
			default:
				m = 0;
				break;
		}
	}
	return m;
}

// Should this be removed? JSON format appears to be Alexa Skill format, not Google Assistant
function isEventFahrenheit(event) {
	return event.payload.appliance.additionalApplianceDetails.temperatureFormat &&
		event.payload.appliance.additionalApplianceDetails.temperatureFormat === 'fahrenheit';
}

function rgb2hsv() {
	const diffc = (c) => ((v - c) / 6 / diff + 1 / 2);
	var rr, gg, bb,
		r = arguments[0] / 255,
		g = arguments[1] / 255,
		b = arguments[2] / 255,
		h, s,
		v = Math.max(r, g, b),
		diff = v - Math.min(r, g, b);

	if (diff == 0) {
		h = s = 0;
	} else {
		s = diff / v;
		rr = diffc(r);
		gg = diffc(g);
		bb = diffc(b);

		if (r === v) {
			h = bb - gg;
		} else if (g === v) {
			h = (1 / 3) + rr - bb;
		} else if (b === v) {
			h = (2 / 3) + gg - rr;
		}
		if (h < 0) {
			h += 1;
		} else if (h > 1) {
			h -= 1;
		}
	}
	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		v: Math.round(v * 100)
	};
}


function hexToRgb(hex) {
	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, (m, r, g, b) => (r + r + g + g + b + b));

	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

module.exports = {
	getRollerShutterData,
	getLightData,
	getSwitchData,
	getColorData,
	toF,
	toC,
	generateControlError,
	normalizeThermostatMode,
	thermostatModeDenormalize,
	isEventFahrenheit,
	rgb2hsv,
	hexToRgb
}

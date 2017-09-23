/**
 * Copyright (c) 2014-2016 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */

/**
 * openHAB Utils helper for temperature, color transformations and more,
 * adapted from the opanHAB Alexa Skill
 * 
 * @author Mehmet Arziman - Initial contribution
 * @author Dan Cunningham - Foundations
 *
 */

//Convert C to F
function toF(value) {
	return Math.round(value * 9 / 5 + 32);
}

//Convert F to C
function toC(value) {
	return ((value - 32) * 5 / 9).toFixed(2);
}

function generateControlError(messageId, name, code, description) {
	var header = {
			namespace: 'Alexa.ConnectedHome.Control',
			name: name,
			payloadVersion: '2',
			messageId: messageId
	};

	var payload = {
			exception: {
				code: code,
				description: description
			}
	};

	var result = {
			header: header,
			payload: payload
	};

	return result;
}

//Normilizes numeric/string thermostat modes to Alexa friendly ones
function normalizeThermostatMode(mode){
	//if state returns as a decimal type, convert to string, this is a very common thermo pattern
	var m = mode;
	switch (mode) {
	case '0': //off, not supported! Weird. But nothing else todo.
		m = 'OFF';
		break;
	case '1': //heating
		m = 'HEAT';
		break;
	case '2': //cooling
		m = 'COOL';
		break;
	case 'heat-cool': //nest auto
	case '3': //auto
		m = 'AUTO';
		break;
	}
	return m.toUpperCase();
}

function isEventFahrenheit(event){
	return event.payload.appliance.additionalApplianceDetails.temperatureFormat &&
	event.payload.appliance.additionalApplianceDetails.temperatureFormat === 'fahrenheit';
}

function rgb2hsv () {
	var rr, gg, bb,
	r = arguments[0] / 255,
	g = arguments[1] / 255,
	b = arguments[2] / 255,
	h, s,
	v = Math.max(r, g, b),
	diff = v - Math.min(r, g, b),
	diffc = function(c){
		return (v - c) / 6 / diff + 1 / 2;
	};

	if (diff == 0) {
		h = s = 0;
	} else {
		s = diff / v;
		rr = diffc(r);
		gg = diffc(g);
		bb = diffc(b);

		if (r === v) {
			h = bb - gg;
		}else if (g === v) {
			h = (1 / 3) + rr - bb;
		}else if (b === v) {
			h = (2 / 3) + gg - rr;
		}
		if (h < 0) {
			h += 1;
		}else if (h > 1) {
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
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		return r + r + g + g + b + b;
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}


module.exports.toF = toF;
module.exports.toC = toC;
module.exports.generateControlError = generateControlError;
module.exports.normalizeThermostatMode = normalizeThermostatMode;
module.exports.isEventFahrenheit = isEventFahrenheit;
module.exports.rgb2hsv = rgb2hsv;
module.exports.hexToRgb = hexToRgb;

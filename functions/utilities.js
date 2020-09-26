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
 * Various reusable utilify functions
 *
 * @author Michael Krug
 *
 */

module.exports = {

  convertToCelsius: (value = 0) => {
    return Number(((value - 32) * 5 / 9).toFixed(1));
  },

  convertToFahrenheit: (value = 0) => {
    return Math.round(value * 9 / 5 + 32);
  },

  kelvin2rgb: (kelvin) => {
    const temp = kelvin / 100;
    const r = temp <= 66 ? 255 : 329.698727446 * Math.pow(temp - 60, -0.1332047592);
    const g = temp <= 66 ? 99.4708025861 * Math.log(temp) - 161.1195681661 : 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
    const b = temp <= 66 ? (temp <= 19 ? 0 : 138.5177312231 * Math.log(temp - 10) - 305.0447927307) : 255;
    return {
      r: r < 0 ? 0 : r > 255 ? 255 : Math.round(r),
      g: g < 0 ? 0 : g > 255 ? 255 : Math.round(g),
      b: b < 0 ? 0 : b > 255 ? 255 : Math.round(b),
    };
  },

  rgb2hsv: ({ r, g, b }) => {
    r = r / 255;
    g = g / 255;
    b = b / 255;
    let v = Math.max(r, g, b), n = v - Math.min(r, g, b);
    let h = n && ((v == r) ? (g - b) / n : ((v == g) ? 2 + (b - r) / n : 4 + (r - g) / n));
    return {
      hue: 60 * (h < 0 ? h + 6 : h),
      saturation: v && n / v,
      value: v
    };
  }

}

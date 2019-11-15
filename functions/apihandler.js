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
 * openHAB REST API handler for requests towards the openHAB REST API
 *
 * @author Mehmet Arziman - Initial contribution
 * @author Dan Cunningham - Foundations
 * @author Michael Krug - Rework
 *
 */
const https = require('https');

class ApiHandler {
  constructor(config = {}, authToken = '') {
    this._config = config;
    this._authToken = authToken;
  }

  getOptions(method = 'GET', itemName = '', length = 0) {
    const options = {
      hostname: this._config.host,
      port: this._config.port,
      path: this._config.path + (itemName || ''),
      method: method,
      headers: {
        'Accept': 'application/json'
      }
    };

    if (this._config.userpass) {
      options.auth = this._config.userpass;
    } else {
      options.headers['Authorization'] = 'Bearer ' + this._authToken;
    }

    if (method === 'POST') {
      options.headers['Content-Type'] = 'text/plain';
      options.headers['Content-Length'] = length;
    }

    return options;
  }


  getItem(itemName = '') {
    const options = this.getOptions('GET', itemName);
    return new Promise((resolve, reject) => {
      const req = https.request(options, (response) => {
        if (200 !== response.statusCode) {
          console.error('getItem failed for path: ' + options.path + ' code: ' + response.statusCode);
          reject({ statusCode: response.statusCode, message: 'getItem failed' });
          return;
        }

        response.setEncoding('utf8');
        let body = '';

        response.on('data', (data) => {
          body += data.toString('utf-8');
        });

        response.on('end', () => {
          resolve(JSON.parse(body));
        });
      });
      req.on('error', reject);
      req.end();
    });
  }

  getItems() {
    return this.getItem();
  }

  sendCommand(itemName = '', payload = '') {
    const options = this.getOptions('POST', itemName, payload.length);
    return new Promise((resolve, reject) => {
      const req = https.request(options, (response) => {
        if (![200, 201].includes(response.statusCode)) {
          console.error('sendCommand failed for path: ' + options.path + ' code: ' + response.statusCode);
          reject({ statusCode: response.statusCode, message: 'sendCommand failed' });
          return;
        }
        resolve();
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }
}

module.exports = { ApiHandler };

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
 * @author Michael Krug - Rework
 *
 */
const https = require('https');

class ApiHandler {
  /**
   * @param {object} config
   */
  constructor(config = { host: '', path: '/rest/items/', port: 80 }) {
    if (!config.path.startsWith('/')) {
      config.path = '/' + config.path;
    }
    if (!config.path.endsWith('/')) {
      config.path += '/';
    }
    this._config = config;
    this._authToken = '';
  }

  /**
   * @param {string} authToken
   */
  set authToken(authToken) {
    this._authToken = authToken;
  }

  /**
   * @param {string} method
   * @param {string} itemName
   * @param {number} length
   */
   getOptions(method = 'GET', itemName = '', length = 0) {
    const queryString = '?metadata=ga,synonyms' + (itemName ? '' : '&fields=groupNames,groupType,name,label,metadata,tags,type,state');
    const options = {
      hostname: this._config.host,
      port: this._config.port,
      path: this._config.path + (itemName ? itemName : '') + queryString,
      method: method,
      headers: {
        'Accept': 'application/json'
      }
    };

    if (this._config.userpass) {
      options.auth = this._config.userpass;
    } else if (this._authToken) {
      options.headers['Authorization'] = 'Bearer ' + this._authToken;
    }

    if (method === 'POST') {
      options.headers['Content-Type'] = 'text/plain';
      options.headers['Content-Length'] = length;
    }

    return options;
  }

  /**
   * @param {string} itemName
   */
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

  /**
   * @param {string} itemName
   * @param {string} payload
   */
  sendCommand(itemName, payload) {
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

module.exports = ApiHandler;

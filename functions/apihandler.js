/**
 * Copyright (c) 2010-2025 Contributors to the openHAB project
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
const REQUEST_TIMEOUT_MS = 10000;

class ApiHandler {
  /**
   * @param {object} config
   */
  constructor(config = { host: '', path: '/rest/items/', port: 80 }) {
    config.path = `/${config.path.replace(/^\/|\/$/g, '')}/`;
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
   */
  getOptions(method = 'GET', itemName = '') {
    const queryString =
      method === 'GET'
        ? `?metadata=ga,synonyms${itemName ? '' : '&fields=groupNames,groupType,name,label,metadata,type,state'}`
        : '';
    const options = {
      hostname: this._config.host,
      port: this._config.port,
      method: method,
      path: this._config.path + (itemName || '') + queryString,
      headers: {
        Accept: 'application/json'
      }
    };

    if (this._config.userpass) {
      options.headers.Authorization = `Basic ${Buffer.from(this._config.userpass).toString('base64')}`;
    } else if (this._authToken) {
      options.headers.Authorization = `Bearer ${this._authToken}`;
    }

    if (method === 'POST') {
      options.headers['Content-Type'] = 'text/plain';
      options.headers['X-OpenHAB-Source'] = 'org.openhab.googleassistant';
    }

    return options;
  }

  /**
   * @param {object} options
   * @returns {string}
   */
  getUrl(options) {
    const protocol = options.port === 443 ? 'https' : 'http';
    return `${protocol}://${options.hostname}:${options.port}${options.path}`;
  }

  /**
   * @param {string} itemName
   */
  async getItem(itemName = '') {
    const options = this.getOptions('GET', itemName);
    let response;
    try {
      response = await fetch(this.getUrl(options), {
        headers: options.headers,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      });
    } catch (error) {
      console.error(`openhabGoogleAssistant - getItem: ERROR ${JSON.stringify(error)}`);
      throw error.cause || error;
    }
    if (response.status !== 200) {
      throw { statusCode: response.status, message: `getItem - failed for path: ${options.path}` };
    }
    try {
      return await response.json();
    } catch (e) {
      throw {
        statusCode: 415,
        message: `getItem - JSON parse failed for path: ${options.path} - ${e.toString()}`
      };
    }
  }

  getItems() {
    return this.getItem();
  }

  /**
   * @param {string} itemName
   * @param {string} payload
   */
  async sendCommand(itemName, payload) {
    const options = this.getOptions('POST', itemName);
    let response;
    try {
      response = await fetch(this.getUrl(options), {
        method: 'POST',
        headers: options.headers,
        body: payload,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      });
    } catch (error) {
      console.error(`openhabGoogleAssistant - sendCommand: ERROR ${JSON.stringify(error)}`);
      throw error.cause || error;
    }
    if (response.status !== 200) {
      throw { statusCode: response.status, message: `sendCommand - failed for path: ${options.path}` };
    }
    return true;
  }
}

module.exports = ApiHandler;

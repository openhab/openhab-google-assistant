/**
 * Copyright (c) 2014-2017 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */

/**
 * openHAB REST API handler for requests towards the openHAB REST API,
 * adapted from the opanHAB Alexa Skill
 * 
 * @author Mehmet Arziman - Initial contribution
 * @author Dan Cunningham - Foundations
 *
 */
var https = require('https');
var config = require('./config.js');

/**
 * Returns all items
 */
function getItems(token, success, failure) {
    return getItem(token, null, success, failure);
}

/**
 * Returns a single item
 */
function getItem(token, itemName, success, failure) {
    var options = httpItemOptions(token, itemName);
    https.get(options, function (response) {
            var body = '';

            response.on('data', function (data) {
                body += data.toString('utf-8');
            });

            response.on('end', function () {
                if (response.statusCode != 200) {
                    failure({
                        message: 'Error response ' + response.statusCode
                    });
                    console.log('getItem failed for path: ' + options.path +
                    ' code: ' + response.statusCode + ' data: ' + data);
                    return;
                }
                var resp = JSON.parse(body);
                success(resp);
            });

            response.on('error', function (e) {
                failure(e);
            });
        })
        .end();
}

/**
 * POST a command to a item
 **/
function postItemCommand(token, itemName, value, success, failure) {
    var options = httpItemOptions(token, itemName, 'POST', value.length);
    var req = https.request(options, function (response) {
        var body = '';
        if (response.statusCode == 200 || response.statusCode == 201) {
            success(response);
        } else {
            failure({
                message: 'Error response ' + response.statusCode
            });
        }
        response.on('error', function (e) {
            failure(e);
        });
    });

    req.write(value);
    req.end();
}

/**
 * Returns a HTTP option object suitable for item commands
 */
function httpItemOptions(token, itemname, method, length) {
    var options = {
        hostname: config.host,
        port: config.port,
        path: config.path + (itemname || ''),
        method: method || 'GET',
        headers: {}
    };

    if (config.userpass) {
        options.auth = config.userpass;
    } else {
        options.headers['Authorization'] = 'Bearer ' + token;
    }

    if (method === 'POST' || method === 'PUT') {
        options.headers['Content-Type'] = 'text/plain';
        options.headers['Content-Length'] = length;
    }
    return options;
}

module.exports.getItems = getItems;
module.exports.getItem = getItem;
module.exports.postItemCommand = postItemCommand;

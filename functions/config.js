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
 * This is the main Backend endpoint configuration.
 * Change the values according your deployment
 *
 * @author Mehmet Arziman - Initial contribution
 *
 * host
 *    REST https host
 *
 * port
 *    REST https port
 *
 * userpass
 *    Optional username:password for the REST server
 *    by default oauth2 tokens will be used for authentication, uncomment this
 *    to use standard BASIC auth when talking directly to a openHAB server.
 *
 * path
 *    Base URL path for openHAB items
 *
 **/
module.exports = {
    //userpass: 'user@foo.com:Password1',
    host: '<YOUR-CLOUD-HOST>',
    port: 443,
    path: '/YOUR/REST/ENDPOINT',
};

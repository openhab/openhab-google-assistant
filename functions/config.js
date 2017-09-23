/**
 * Copyright (c) 2014-2017 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */

/**
 * This is the main Backend endpoint configuration.
 * Change the values according your deployment
 * 
 * @author Mehmet Arziman - Initial contribution
 * @author Dan Cunningham - Foundations
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

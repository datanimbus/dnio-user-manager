'use strict';

var ldap = require('ldapjs');
const logger = global.logger;
let ldapConfig = require('../../../config/config').ldapConfig;
let e = {};

e.connectLDAP = function (url, dn, pwd) {
	return new Promise((resolve, reject) => {
		let options = {
			url: url,
			reconnect: true
		};
		if (typeof process.env.TLS_REJECT_UNAUTHORIZED == 'string' && process.env.TLS_REJECT_UNAUTHORIZED.toLowerCase() == 'false') {
			options.tlsOptions = {
				rejectUnauthorized: false,
				ecdhCurve: 'secp384r1'
			};
		}
		if (ldapConfig && ldapConfig.connectTimeout) options.connectTimeout = ldapConfig.connectTimeout;
		try {
			let client = ldap.createClient(options);
			client.on('error', function (err) {
				if (err) {
					logger.error(err.message);
					return reject({ connection: false });
				}
			});
			client.bind(dn, pwd, function (err, res) {
				if (err) {
					logger.error(err.message);
					return reject({ connection: true, authentication: false });
				}
				else {
					logger.debug(res);
					return resolve(client);
				}
			});
		} catch (err) {
			logger.error(err);
		}

	});
};

e.searchLdap = function (client, base, filter, attributes, sizeLimit) {
	let opts = {
		scope: 'sub'
	};
	if (attributes) opts.attributes = attributes;
	if (ldapConfig.recordFetchTimeLimit) opts.timeLimit = ldapConfig.recordFetchTimeLimit;
	if (filter) opts.filter = filter;
	return new Promise((resolve, reject) => {
		client.search(base, opts, function (err, res) {
			let array = [];
			if (err) {
				return reject(err);
			}
			res.on('searchEntry', function (entry) {
				array.push(entry.object);
				if (sizeLimit && array.length >= sizeLimit) {
					return resolve(array);
				}
			});
			res.on('error', function (err) {
				logger.error(err.message);
				return reject({ connection: true, authentication: true, users: false });
			});
			res.on('end', function () {
				return resolve(array);
			});
		});
	});
};

module.exports = e;
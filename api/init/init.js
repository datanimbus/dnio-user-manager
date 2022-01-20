'use strict';

// const request = require('request');
const mongoose = require('mongoose');
const kubeutil = require('@appveen/data.stack-utils').kubeutil;

const config = require('../../config/config');

const logger = global.logger;
// const appHook = require('../helpers/util/appHooks');
// const pmRole = require('../../config/roles').find(_r => _r.entity == 'PM');
// const nsRole = require('../../config/roles').find(_r => _r.entity == 'NS');

// let _ = require('lodash');
let validateAzureCredentials = require('../helpers/util/azureAd.util').validateAzureCredentials;
let validateLdapCredentials = require('../helpers/util/ldap.util').validateLdapCredentials;
let release = process.env.RELEASE;

function createNSifNotExist(ns) {
	return kubeutil.namespace.getNamespace(ns)
		.then(_d => {
			if (_d && _d.statusCode >= 200 && _d.statusCode < 400) {
				logger.debug(ns + ' already exist');
				return _d;
			} else {
				logger.debug('Creating ' + ns);
				return kubeutil.namespace.createNamespace(ns, release)
					.then(_ => {
						if (_.statusCode != 200 || _.statusCode != 202) {
							logger.error(_.message);
							logger.debug(JSON.stringify(_));
							return Error(_.message);
						}
						return _;
					});
			}
		})
		.catch(err => {
			logger.error('Error creating namespace ' + ns);
			logger.error(err.message);
		});
}

function createSecurityKeys() {
	const keysModel = mongoose.model('keys');
	logger.info('Calling security model to create keys of app');
	return mongoose.model('app').find({}).lean(true)
		.then(apps => {
			let promises = apps.map(async (doc) => {
				try {
					let body = { app: doc._id };
					let keyDoc = await keysModel.findOne({ app: doc._id }).lean();
					if (keyDoc) {
						return;
					}
					keyDoc = new keysModel(body);
					return keyDoc.save();
				} catch (err) {
					logger.error(err);
				}
				// return appHook.sendRequest(config.baseUrlSEC + `/app/${doc._id}`, 'post', null, body, null)
				// 	.catch(err => logger.debug(err.message));
			});
			return Promise.all(promises);
		})
		.then(() => {
			logger.debug('Created security keys for apps');
		})
		.catch(err => {
			logger.debug(err.message);
		});
}

function createNS() {
	let dataStackNS = config.dataStackNS;
	if (!(dataStackNS && config.isK8sEnv())) return Promise.resolve();
	logger.info('Creating namespace if not exist');
	return mongoose.model('app').find({}).lean(true)
		.then(apps => {
			let promises = apps.map(doc => {
				const ns = dataStackNS + '-' + doc._id.toLowerCase().replace(/ /g, '');
				return createNSifNotExist(ns);
			});
			return Promise.all(promises);
		})
		.then(() => {
			logger.debug('Created Namespaces');
			return Promise.resolve();
		})
		.catch(err => {
			logger.debug(err.message);
		});
}

// function createPMrole() {
// 	logger.debug('Creating PM roles');
// 	let appList = [];
// 	return mongoose.model('app').find({}).lean(true)
// 		.then(apps => {
// 			appList = apps.map(_d => _d._id);
// 			return mongoose.model('roles').find({ entity: 'PM' }, { app: 1 }).lean(true);
// 		})
// 		.then(roles => {
// 			let rolesAppList = roles.map(_r => _r.app);
// 			let appRoleTobeCreated = _.difference(appList, rolesAppList);
// 			let promises = appRoleTobeCreated.map(app => {
// 				let roleObj = JSON.parse(JSON.stringify(pmRole));
// 				roleObj.app = app;
// 				roleObj.fields = JSON.stringify(roleObj.fields);
// 				return mongoose.model('roles').create(roleObj)
// 					.catch(err => { logger.debug(err); });
// 			});
// 			return Promise.all(promises);
// 		})
// 		.then(_d => {
// 			logger.debug(JSON.stringify(_d));
// 		})
// 		.catch(err => {
// 			logger.error(err);
// 		});
// }

// function createNSrole() {
// 	logger.debug('Creating NS roles');
// 	let appList = [];
// 	return mongoose.model('app').find({}).lean(true)
// 		.then(apps => {
// 			appList = apps.map(_d => _d._id);
// 			return mongoose.model('roles').find({ entity: 'NS' }, { app: 1 }).lean(true);
// 		})
// 		.then(roles => {
// 			let rolesAppList = roles.map(_r => _r.app);
// 			let appRoleTobeCreated = _.difference(appList, rolesAppList);
// 			let promises = appRoleTobeCreated.map(app => {
// 				let roleObj = JSON.parse(JSON.stringify(nsRole));
// 				roleObj.app = app;
// 				roleObj.fields = JSON.stringify(roleObj.fields);
// 				return mongoose.model('roles').create(roleObj)
// 					.catch(err => { logger.debug(err); });
// 			});
// 			return Promise.all(promises);
// 		})
// 		.then(_d => {
// 			logger.debug(JSON.stringify(_d));
// 		})
// 		.catch(err => {
// 			logger.error(err);
// 		});
// }

// function checkDependency() {
// 	var options = {
// 		url: config.baseUrlSEC + '/health/ready',
// 		method: 'GET',
// 		headers: {
// 			'Content-Type': 'application/json'
// 		},
// 		json: true
// 	};
// 	return new Promise((resolve, reject) => {
// 		request(options, function (err, res, body) {
// 			if (err) {
// 				logger.error(err.message);
// 				reject(err);
// 			} else if (!res) {
// 				logger.error('Server is DOWN');
// 				reject(new Error('Server is down'));
// 			}
// 			else {
// 				if (res.statusCode >= 200 && res.statusCode < 400) {
// 					logger.info('Connected to Security');
// 					resolve();
// 				} else {
// 					logger.debug(res.statusCode);
// 					logger.debug(body);
// 					reject(new Error('Request returned ' + res.statusCode));
// 				}
// 			}
// 		});
// 	});
// }

function checkDependency() {
	return Promise.resolve();
}

function removeAuthMode(authMode, err) {
	logger.error(`Removing auth mode ${authMode} due to error :: `, err);
	config.RBAC_USER_AUTH_MODES = config.RBAC_USER_AUTH_MODES.filter(mode => mode != authMode);
}

function validateAuthModes() {
	let authModes = config.RBAC_USER_AUTH_MODES;
	logger.debug('validating auth modes :: ', authModes);
	let validationArray = authModes.map(mode => {
		if (mode == 'azure')
			return validateAzureCredentials(config.azureConfig).catch((err) => removeAuthMode('azure', err));
		else if (mode == 'ldap')
			return validateLdapCredentials(config.ldapDetails)
				.catch((err) => removeAuthMode('ldap', err));
		else if (mode == 'local')
			return Promise.resolve();
		else {
			logger.error('Unknow auth mode :: ', mode);
			return Promise.reject(new Error('Unknown auth mode.'));
		}
	});
	return Promise.all(validationArray)
		.then(() => logger.info('Supported auth modes :: ', config.RBAC_USER_AUTH_MODES))
		.catch(err => logger.error('Error in validateAuthModes :: ', err));
}

async function createIndexForSession() {
	const db = global.mongoConnection.db(config.mongoOptions.dbName);
	try {
		await db.collection('userMgmt.sessions').createIndex(
			{ 'expireAt': 1 }, { expireAfterSeconds: 0 }
		);
		await db.collection('userMgmt.sessions').createIndex(
			{
				username: 'text',
				type: 'text'
			}
		);
		logger.info('Successfully created indexes for sessions collection');
	} catch (error) {
		//
		logger.error(error);
	}
}

function init() {
	return checkDependency()
		.then(() => createNS())
		// .then(() => createPMrole())
		// .then(() => createNSrole())
		.then(() => createSecurityKeys())
		.then(() => validateAuthModes())
		.then(() => createIndexForSession());
}

module.exports = init;
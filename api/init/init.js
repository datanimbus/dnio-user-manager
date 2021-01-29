'use strict';

const mongoose = require('mongoose');
const logger = global.logger;
const config = require('../../config/config');
const appHook = require('../helpers/util/appHooks');
const kubeutil = require('@appveen/data.stack-utils').kubeutil;
const request = require('request');
const pmRole = require('../../config/roles').find(_r => _r.entity == 'PM');
const nsRole = require('../../config/roles').find(_r => _r.entity == 'NS');

let _ = require('lodash');
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
	logger.info('Calling security model to create keys of app');
	return mongoose.model('app').find({}).lean(true)
		.then(apps => {
			let promises = apps.map(doc => {
				let body = { app: doc._id };
				return appHook.sendRequest(config.baseUrlSEC + `/${doc._id}/initialize`, 'post', null, body, null)
					.catch(err => logger.debug(err.message));
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

function createPMrole() {
	logger.debug('Creating PM roles');
	let appList = [];
	return mongoose.model('app').find({}).lean(true)
		.then(apps => {
			appList = apps.map(_d => _d._id);
			return mongoose.model('roles').find({ entity: 'PM' }, { app: 1 }).lean(true);
		})
		.then(roles => {
			let rolesAppList = roles.map(_r => _r.app);
			let appRoleTobeCreated = _.difference(appList, rolesAppList);
			let promises = appRoleTobeCreated.map(app => {
				let roleObj = JSON.parse(JSON.stringify(pmRole));
				roleObj.app = app;
				roleObj.fields = JSON.stringify(roleObj.fields);
				return mongoose.model('roles').create(roleObj)
					.catch(err => { logger.debug(err); });
			});
			return Promise.all(promises);
		})
		.then(_d => {
			logger.debug(JSON.stringify(_d));
		})
		.catch(err => {
			logger.error(err);
		});
}

function createNSrole() {
	logger.debug('Creating NS roles');
	let appList = [];
	return mongoose.model('app').find({}).lean(true)
		.then(apps => {
			appList = apps.map(_d => _d._id);
			return mongoose.model('roles').find({ entity: 'NS' }, { app: 1 }).lean(true);
		})
		.then(roles => {
			let rolesAppList = roles.map(_r => _r.app);
			let appRoleTobeCreated = _.difference(appList, rolesAppList);
			let promises = appRoleTobeCreated.map(app => {
				let roleObj = JSON.parse(JSON.stringify(nsRole));
				roleObj.app = app;
				roleObj.fields = JSON.stringify(roleObj.fields);
				return mongoose.model('roles').create(roleObj)
					.catch(err => { logger.debug(err); });
			});
			return Promise.all(promises);
		})
		.then(_d => {
			logger.debug(JSON.stringify(_d));
		})
		.catch(err => {
			logger.error(err);
		});
}

function checkDependency() {
	var options = {
		url: config.baseUrlSEC + '/health/ready',
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		},
		json: true
	};
	return new Promise((resolve, reject) => {
		request(options, function (err, res, body) {
			if (err) {
				logger.error(err.message);
				reject(err);
			} else if (!res) {
				logger.error('Server is DOWN');
				reject(new Error('Server is down'));
			}
			else {
				if (res.statusCode >= 200 && res.statusCode < 400) {
					logger.info('Connected to Security');
					resolve();
				} else {
					logger.debug(res.statusCode);
					logger.debug(body);
					reject(new Error('Request returned ' + res.statusCode));
				}
			}
		});
	});
}

function init() {
	return checkDependency()
		.then(() => createNS())
		.then(() => createPMrole())
		.then(() => createNSrole())
		.then(() => createSecurityKeys());
}

module.exports = init;
'use strict';

// const request = require('request');
const mongoose = require('mongoose');
const _ = require('lodash');
const kubeutil = require('@appveen/data.stack-utils').kubeutil;

const config = require('../../config/config');
// const adUtils = require('../utils/azure.ad.utils');

const logger = global.logger;
const azureConfig = config.azureConfig;

// let _ = require('lodash');
// let validateAzureCredentials = require('../helpers/util/azureAd.util').validateAzureCredentials;
// let validateLdapCredentials = require('../helpers/util/ldap.util').validateLdapCredentials;
let release = process.env.RELEASE;

async function updateExistingAppConnectors() {
	try {
		const connectorsModel = mongoose.model('config.connectors');
		const apps = await mongoose.model('app').find({ "connectors": { "$exists": false } });
		const promises = apps.map(async (doc) => {
			try {
				if (!doc.connectors) {
					doc.connectors = {
						data: {},
						file: {}
					};
				}

				let connectors = await connectorsModel.find({ app: doc._id, "$or": [{"name": "Default DB Connector"}, {"name": "Default File Connector"}] }).lean();
				
				if (connectors.length !== 2) {
					let dbConnector = _.find(connectors, conn => conn.options?.default && conn.name === 'Default DB Connector');
					let fileConnector = _.find(connectors, conn => conn.options?.default && conn.name === 'Default File Connector');

					if (!fileConnector) {
						let connector = {};
						connector.category = 'STORAGE';
						connector.type = 'GRIDFS';
						connector.name = 'Default File Connector';
						connector.app = doc._id;
						connector.options = {
							default: true
						};
						connector.values = {
							connectionString: config.mongoUrlAppcenter
						};

						let fileConnDoc = new connectorsModel(connector);
						let con = fileConnDoc.save();
						logger.debug(con._id + 'Connector created.');
						doc.connectors.file = {
							_id: con._id
						};
					}

					if (!dbConnector) {
						let connector = {};
						connector.category = 'DB';
						connector.type = 'MONGODB';
						connector.name = 'Default DB Connector';
						connector.app = doc._id;
						connector.options = {
							default: true
						};
						connector.values = {
							connectionString: config.mongoUrlAppcenter
						};

						let dbConnDoc = new connectorsModel(connector);
						let con = await dbConnDoc.save();
						logger.debug(con._id + 'Connector created.');
						doc.connectors.data = {
							_id: con._id
						};
					}
				} else {
					let dbConnector = _.find(connectors, conn => conn.options?.default && conn.name === 'Default DB Connector');
					let fileConnector = _.find(connectors, conn => conn.options?.default && conn.name === 'Default File Connector');
					
					if (!doc.connectors?.data?._id) {
						doc.connectors.data._id = dbConnector?._id;
					}

					if (!doc.connectors?.file?._id) {
						doc.connectors.file._id = fileConnector?._id;
					}
				}
				doc.save();
			} catch (err) {
				logger.error(err);
			}
		await Promise.all(promises);
		logger.debug('Created connectors for apps');
		});
	} catch (err) {
		logger.error(err.message);
	}
}

async function createNSifNotExist(ns) {
	try {
		let response = await kubeutil.namespace.getNamespace(ns);
		if (response && response.statusCode >= 200 && response.statusCode < 400) {
			logger.debug('Namespace : ' + ns + ' already exist');
			return response;
		}
		logger.debug('Creating Namespace : ' + ns);
		response = await kubeutil.namespace.createNamespace(ns, release);
		if (response.statusCode != 200 || response.statusCode != 202) {
			logger.error(response.message);
			logger.debug(JSON.stringify(response));
			return Error(response.message);
		}
		return response;
	} catch (err) {
		logger.error('Error creating namespace ' + ns);
		logger.error(err.message);
	}
}

async function createSecurityKeys() {
	try {
		const keysModel = mongoose.model('keys');
		logger.info('Calling security model to create keys of app');
		const apps = await mongoose.model('app').find({}).lean();
		const promises = apps.map(async (doc) => {
			try {
				let body = { app: doc._id };
				let keyDoc = await keysModel.findOne({ app: doc._id }).lean();
				if (keyDoc) {
					logger.debug('Security keys exists for app : ', doc._id);
					return;
				}
				logger.debug('Creating Security keys for app : ', doc._id);
				keyDoc = new keysModel(body);
				return keyDoc.save();
			} catch (err) {
				logger.error(err);
			}
		});
		await Promise.all(promises);
		logger.debug('Created security keys for apps');
	} catch (err) {
		logger.error(err.message);
	}
}

async function createNS() {
	try {
		let dataStackNS = config.dataStackNS;
		if (!(dataStackNS && config.isK8sEnv())) return Promise.resolve();
		logger.info('Creating namespace if not exist');
		const apps = await mongoose.model('app').find({}).lean();
		let promises = apps.map(doc => {
			const ns = dataStackNS + '-' + doc._id.toLowerCase().replace(/ /g, '');
			return createNSifNotExist(ns);
		});
		await Promise.all(promises);
		logger.debug('Created Namespaces');
	} catch (err) {
		logger.error(err.message);
	}
}

function checkDependency() {
	return Promise.resolve();
}

function removeAuthMode(authMode) {
	config.RBAC_USER_AUTH_MODES = config.RBAC_USER_AUTH_MODES.filter(mode => mode != authMode);
}

async function checkAzureDependencies() {
	try {
		let flag = false;
		if (!azureConfig.b2cTenant) {
			logger.error('Missing AZURE.TENANT');
			flag = true;
		}
		if (!azureConfig.clientId) {
			logger.error('Missing AZURE.CLIENT_ID');
			flag = true;
		}
		if (!azureConfig.clientSecret) {
			logger.error('Missing AZURE.CLIENT_SECRET');
			flag = true;
		}
		if (flag) {
			logger.error('One or more Azure Configuration Parameters Missing.');
			logger.error('Azure AD will not be Configured.');
			return false;
		}
		logger.info('Please Ensure the Callback URL configured in Azure AD App is this:-');
		logger.info(`https://${config.commonName}/api/a/rbac/auth/azure/login/callback`);
		logger.info('');
		// const url = await adUtils.getAuthUrl('initial-setup');
		// logger.info('Please Use the Below URL and Login with the AD User that will be Super Admin of Data Stack.');
		// logger.info(url);

		return true;
	} catch (err) {
		logger.error(err);
		return false;
	}
}

async function validateAuthModes() {
	const authModes = config.RBAC_USER_AUTH_MODES;
	logger.info('validating auth modes :: ', authModes);
	const localAvailable = authModes.indexOf('local') > -1;
	await authModes.reduce(async (prev, curr) => {
		await prev;
		let flag = true;
		if (curr == 'azure') {
			flag = await checkAzureDependencies();
			if (!flag && !localAvailable) {
				logger.error('Local Auth Mode not configured and Azure Configuration Details missing.');
				logger.error('Cannot Start Application until atleast one Valid Auth Mode Available');
				process.exit(0);
			}
			if (!flag) {
				removeAuthMode(curr, null);
			}
		} else if (curr == 'ldap') {
			return Promise.resolve();
		} else if (curr == 'local') {
			return Promise.resolve();
		} else {
			logger.error('Unknow auth mode :: ', curr);
			removeAuthMode(curr, null);
		}
	}, Promise.resolve());

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
		logger.error(error);
	}
}

function init() {
	return checkDependency()
		.then(() => createNS())
		.then(() => createSecurityKeys())
		.then(() => validateAuthModes())
		.then(() => createIndexForSession())
		.then(() => updateExistingAppConnectors());
}

module.exports = init;
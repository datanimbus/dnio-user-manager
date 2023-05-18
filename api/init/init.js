'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');

const kubeutil = require('@appveen/data.stack-utils').kubeutil;

const config = require('../../config/config');

const logger = global.logger;
const azureConfig = config.azureConfig;
let release = process.env.RELEASE;


async function updateExistingAppConnectors() {
	try {
		logger.info('=== Updating existing apps with default connectors ===');

		const connectorsModel = mongoose.model('config.connectors');
		const apps = await mongoose.model('app').find({ 'connectors': { '$exists': false } }).lean();
		
		logger.info(`Total no. of apps without connectors :: ${apps.length}`);
		logger.trace(`Apps :: ${JSON.stringify(apps)}`);

		const promises = apps.map(async (doc) => {
			try {
				logger.info(`Processing App :: ${doc._id}`);
				logger.trace(`Processing App :: ${JSON.stringify(doc)}`);

				if (!doc.connectors || _.isEmpty(doc.connectors)) {
					doc.connectors = {
						data: {},
						file: {}
					};
				}

				let connectors = await connectorsModel.find({ app: doc._id, name: { $in: ['Default DB Connector', 'Default File Connector'] } }).lean();
				logger.info(`No of connectors found for app :: ${doc._id} :: ${connectors.length}`);
				logger.trace(`Connectors found for app :: ${doc._id} :: ${JSON.stringify(connectors)}`);

				let dbConnector = _.find(connectors, conn => conn.name === 'Default DB Connector');
				let fileConnector = _.find(connectors, conn => conn.name === 'Default File Connector');

				if (connectors.length !== 2) {
					if (!fileConnector) {
						logger.info(`File connector not found for app :: ${doc._id}`);
						let connector = {};
						connector.category = 'STORAGE';
						connector.type = 'GRIDFS';
						connector.name = 'Default File Connector';
						connector.app = doc._id;
						connector.options = {
							default: true,
							isValid: true
						};
						connector.values = {
							connectionString: ''
						};

						let fileConnDoc = new connectorsModel(connector);
						let status = await fileConnDoc.save();
						logger.info(`File connector created for app :: ${doc._id} :: ${status._id}`);
						doc.connectors.file = {
							_id: status._id
						};
					}

					if (!dbConnector) {
						logger.info(`Data connector not found for app :: ${doc._id}`);
						let connector = {};
						connector.category = 'DB';
						connector.type = 'MONGODB';
						connector.name = 'Default DB Connector';
						connector.app = doc._id;
						connector.options = {
							default: true,
							isValid: true
						};
						connector.values = {
							connectionString: '',
							database: ''
						};

						let dbConnDoc = new connectorsModel(connector);
						let status = await dbConnDoc.save();
						logger.info(`Data connector created for app :: ${doc._id} :: ${status._id}`);
						doc.connectors.data = {
							_id: status._id
						};
					}
				} else {
					if (!doc.connectors?.data?._id) {
						logger.info(`Setting data connector for app :: ${doc._id} :: ${dbConnector?._id}`);
						doc.connectors.data._id = dbConnector?._id;
					}

					if (!doc.connectors?.file?._id) {
						logger.info(`Setting file connector for app :: ${doc._id} :: ${fileConnector?._id}`);
						doc.connectors.file._id = fileConnector?._id;
					}
				}
				await mongoose.model('app').updateOne({ '_id': doc._id }, { '$set': doc });
				logger.info(`Updated app :: ${doc._id} :: with connectors`);
			} catch (err) {
				logger.error(err);
			}
		});
		await Promise.all(promises);
		logger.info('=== Updated all apps with default connectors ===');
	} catch (err) {
		logger.error(err.message);
	}
}


async function updateExistingServiceConnectors() {
	try {
		logger.info('=== Updating existing services with default connectors ===');
		
		const appModel = mongoose.model('app');
		const db = global.mongoConnection.useDb(config.mongoOptions.dbName);
		let services = await db.collection('services').find({ 'status': { '$nin': [ 'Draft' ] }, 'connectors': { '$exists': false } }).toArray();
		
		logger.info(`Total no. of services without connectors :: ${services.length}`);
		logger.trace(`Services :: ${JSON.stringify(services)}`);

		let apps = services.map(e => e.app);
		apps = _.uniq(apps);
		let appsList = [];

		let promises = await apps.map(async e => {
			let app = await appModel.findById(e, {'connectors': 1}).lean();
			appsList.push(app);
		});
		await Promise.all(promises);
		
		promises = services.map(async (doc) => {
			try {
				logger.debug(`Processing Service :: ${doc._id} :: app :: ${doc.app}`);
				logger.trace(`Processing Service :: ${JSON.stringify(doc)}`);

				let app = _.find(appsList, a => a._id == doc.app);

				logger.debug(`Default connectors for the app :: ${JSON.stringify(app)}`);

				doc.connectors = app.connectors;

				await db.collection('services').updateOne({ '_id': doc._id }, { '$set': doc });
			} catch(err) {
				logger.error(err);
			}
		});
		await Promise.all(promises);
		logger.info('=== Updated existing services with default connectors ===');
	} catch(err) {
		logger.error(err);
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
		// const keysModel = mongoose.model('keys');
		logger.info('Calling security model to create keys of app');
		const apps = await mongoose.model('app').find({});
		const promises = apps.map(async (doc) => {
			try {
				if (!doc.encryptionKey) {
					// generate random key and encrypt using global enc key
					// let randomString = "";
					// const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
					// for (let i = 0; i < len; i++) {
					// 	randomString += possible.charAt(Math.floor(Math.random() * possible.length));
					// }

					// const Key = cryptUtils.encrypt(randomString, config.encryptionKey);

					// doc.encryptionKey = Key;

					return doc.save();
				}
				// let body = { app: doc._id };
				// let keyDoc = await keysModel.findOne({ app: doc._id }).lean();
				// if (keyDoc) {
				// 	logger.debug('Security keys exists for app : ', doc._id);
				// 	return;
				// }
				// logger.debug('Creating Security keys for app : ', doc._id);
				// keyDoc = new keysModel(body);
				// return keyDoc.save();
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
	const db = global.mongoConnection.useDb(config.mongoOptions.dbName);
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
		.then(() => updateExistingAppConnectors())
		.then(() => updateExistingServiceConnectors())
		.then(() => createSecurityKeys())
		.then(() => validateAuthModes())
		.then(() => createIndexForSession())
}


module.exports = init;

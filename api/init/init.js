'use strict';

const mongoose = require('mongoose');
const logger = global.logger;
const config = require('../../config/config');
const appHook = require('../helpers/util/appHooks');
const kubeutil = require('@appveen/odp-utils').kubeutil;
const request = require('request');
const pmRole = require('../../config/roles').find(_r => _r.entity == 'PM');
const nsRole = require('../../config/roles').find(_r => _r.entity == 'NS');
const mongo = require('mongodb').MongoClient;

let defaultRoles = require('../../config/roles');
let smRoles = defaultRoles.find(_r => _r.entity === 'SM');
let gsRoles = defaultRoles.find(_r => _r.entity === 'GS');
let _ = require('lodash');
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

function fixSMRolesinNewRelease() {
	if (!release || !smRoles.fields) return Promise.resolve();
	logger.debug('Fixing SM roles.....');
	return mongoose.model('roles')
		.find({
			entity: {
				$in: ['SM', /^SM_/]
			},
			'_metadata.version.release': { $ne: release }
		})
		.then(data => {
			logger.debug('Documents need to be fixed ' + data.length);
			var arrays = [],
				size = 100;
			while (data.length > 0) {
				arrays.push(data.splice(0, size));
			}
			return arrays.reduce((_p, arr) => {
				return _p.then(() => addingFieldsSM(arr));
			}, Promise.resolve());
		})
		.then(() => {
			logger.debug('Fixed all SM roles');
		})
		.catch(err => {
			logger.error(err);
		});
}

function fixGSRolesinNewRelease() {
	if (!release || !gsRoles.fields) return Promise.resolve();
	logger.debug('Fixing GS roles.....');
	return mongoose.model('roles')
		.find({
			entity: {
				$in: ['GS', /^GS_/]
			},
			'_metadata.version.release': { $ne: release }
		})
		.then(data => {
			logger.debug('Documents need to be fixed ' + data.length);
			var arrays = [],
				size = 100;
			while (data.length > 0) {
				arrays.push(data.splice(0, size));
			}
			return arrays.reduce((_p, arr) => {
				return _p.then(() => addingFieldsGS(arr));
			}, Promise.resolve());
		})
		.then(() => {
			logger.debug('Fixed all GS roles');
		})
		.catch(err => {
			logger.error(err);
		});
}

function fixPMRolesinNewRelease() {
	if (!release || !pmRole.fields) return Promise.resolve();
	logger.debug('Fixing PM roles.....');
	return mongoose.model('roles')
		.find({
			entity: {
				$in: ['PM', /^PM_/]
			},
			'_metadata.version.release': { $ne: release }
		})
		.then(data => {
			logger.debug('Documents need to be fixed ' + data.length);
			var arrays = [],
				size = 100;
			while (data.length > 0) {
				arrays.push(data.splice(0, size));
			}
			return arrays.reduce((_p, arr) => {
				return _p.then(() => addingFieldsPM(arr));
			}, Promise.resolve());
		})
		.then(() => {
			logger.debug('Fixed all PM roles');
		})
		.catch(err => {
			logger.error(err);
		});
}

let roleIdList = [
	'PNDS', 'PNDSD', 'PNDSE', 'PNDSR',
	'PNL', 'PNDF', 'PNBM', 'PNA', 'PNPP', 'PNPH', 'PNPM', 'PNUB', 'PNGB', 'PNGADS', 'PNGAL', 'PNGADF', 'PNGAP', 'PNGANS', 'PNGAA', 'PNGAU', 'PNGAB', 'PNGABM', 'PNGAG', 'PNGCDS', 'PNGCI', 'PNGCBM', 'PNGMU', 'PNGMB', 'PVDSD', 'PVDSE', 'PVDSR', 'PVL', 'PVDF', 'PVBM', 'PVA', 'PVPP', 'PVPH', 'PVUB', 'PVBB', 'PVGB', 'PVGADS', 'PVGAL', 'PVGADF', 'PVAGP', 'PVGANS', 'PVGAA', 'PVGAU', 'PVGAB', 'PVGABM', 'PVGAG', 'PVGCDS', 'PVGCI', 'PVGCBM', 'PVGMU', 'PVGMB', 'PMDSD', 'PMDSE', 'PMDSR', 'PML', 'PMDF', 'PMBM', 'PMA', 'PMPP', 'PMPH', 'PMPM', 'PMUBC', 'PMUBCE', 'PMUBU', 'PMUBD', 'PMUA', 'PMUG', 'PMBBC', 'PMBBCE', 'PMBBU', 'PMBBD', 'PMBA', 'PMBG', 'PMGBC', 'PMGBU', 'PMGBD', 'PMGADS', 'PMGAL', 'PMGADF', 'PMAGP', 'PMGANS', 'PMGAA', 'PMGAU', 'PMGAB', 'PMGABM', 'PMGAG', 'PMGCDS', 'PMGCI', 'PMGCBM', 'PMGMUC', 'PMGMUD', 'PMGMBC', 'PMGMBD', 'PNDSB', 'PVDSB', 'PMDSBC', 'PMDSBU', 'PMDSBD', 'PMDSPD', 'PMDSPS', 'PNDSPD', 'PNDSPS', 'PVDSIDPR', 'PMDSIDPR', 'PNDSIDPR', 'PVDSIDPO', 'PMDSIDPO', 'PNDSIDPO', 'PVDSIRSU', 'PMDSIRSU', 'PNDSIRSU', 'PVDSIRAP', 'PMDSIRAP', 'PNDSIRAP', 'PVDSIRRJ', 'PMDSIRRJ', 'PNDSIRRJ', 'PVDSIRDI', 'PMDSIRDI', 'PNDSIRDI', 'PVDSIRRW', 'PMDSIRRW', 'PNDSIRRW', 'PVDSSDH', 'PMDSSDH', 'PNDSSDH', 'PVDSSRE', 'PMDSSRE', 'PNDSSRE', 'PVDSSEP', 'PMDSSEP', 'PNDSSEP', 'PVDSSFS', 'PMDSSFS', 'PNDSSFS', 'PVDSSPR', 'PMDSSPR', 'PNDSSPR', 'PVPB', 'PNPB', 'PMPBC', 'PMPBU', 'PMPBD', 'PNPFMB', 'PVPFMB', 'PMPFMBC', 'PMPFMBD', 'PMPFMBU', 'PNPFPD', 'PNPFPS', 'PMPFPD', 'PMPFPS', 'PNPP', 'PVPP', 'PMPPC', 'PMPPD', 'PNPH', 'PVDSAAP', 'PNDSAAP', 'PVDSASR', 'PNDSASR', 'PVDSAPO', 'PNDSAPO', 'PVDSAPR', 'PNDSAPR', 'PMDSSPD', 'PNDSSPD', 'PVDSSPD', 'PVNSB', 'PNNSB', 'PMNSBC', 'PMNSBU', 'PMNSBD', 'PMNSIO', 'PVNSIO', 'PNNSIO', 'PVNSURL', 'PMNSURL', 'PNNSURL', 'PVNSH', 'PMNSH', 'PNNSH', 'PMABC', 'PMABU', 'PVAB', 'PNAB', 'PVAPW', 'PMAPW', 'PMAEN', 'PMABD', 'PMADL', 'PNAPW', 'PNAEN', 'PNADL', 'PMAS', 'PNAS'];

function fixGroupRolesinNewRelease() {
	if (!release) return Promise.resolve();
	logger.debug('Fixing roles in Group.....');
	let changedRoleId = ['PNG', 'PVG', 'PMG', 'PNU', 'PVU', 'PMU', 'PNB', 'PVB', 'PMB', 'PMDS', 'PNDS', 'PVDS', 'PMDSI', 'PNDSI', 'PVDSI', 'PVDSS', 'PNDSS', 'PMDSS', 'PVP', 'PMP', 'PNP', 'PMPF', 'PVPF', 'PNPF', 'PMNS', 'PVNS', 'PNNS', 'PMA', 'PNA', 'PVA', 'PNPFM', 'PVPFM', 'PMPFM'];
	return mongoose.model('group')
		.find({
			'roles.id': {
				$in: changedRoleId
			},
			'_metadata.version.release': { $ne: release }
		})
		.then(_grps => {
			let promises = _grps.map(_grp => {
				let newRoleArr = [];
				_grp.roles.forEach(_obj => {
					let index = changedRoleId.indexOf(_obj.id);
					if (index > -1) {
						roleIdList.filter(_r => _r.startsWith(_obj.id)).forEach(_k => {
							newRoleArr.push({ id: _k, app: _obj.app, entity: _obj.entity, type: _obj.type });
						});
					} else {
						newRoleArr.push(_obj);
					}
				});
				_grp.roles = newRoleArr;
				_grp.markModified('roles');
				_grp._metadata.version.release = release;
				_grp.markModified('_metadata.version.release');
				return _grp.save();
			});
			return Promise.all(promises);
		})
		.then(_res => {
			logger.info('Groups fixed ' + _res.map(_d => _d._id));
		})
		.catch(err => {
			logger.error(err);
		});
}

function addingFieldsSM(srvc) {
	var count = 0;
	var promises = srvc.map(s => {
		let newFields = JSON.stringify(smRoles.fields);
		let newroles = smRoles.roles;
		return mongoose.model('roles').update({ '_id': s._id }, { $set: { 'fields': newFields, 'roles': newroles, '_metadata.version.release': release } })
			.then(_d => {
				logger.debug({ _d });
				count++;
				logger.debug('Default fields created for ' + s.entity + ' in app ' + s.app);
			})
			.catch(err => {
				logger.error(err);
			});
	});
	return Promise.all(promises)
		.then(() => {
			logger.info('Total number of documents updated in batch ' + count);
		});
}

function addingFieldsGS(srvc) {
	var count = 0;
	var promises = srvc.map(s => {
		let newFields = JSON.stringify(gsRoles.fields);
		return mongoose.model('roles').update({ '_id': s._id }, { $set: { 'fields': newFields, '_metadata.version.release': release } })
			.then(_d => {
				logger.debug({ _d });
				count++;
				logger.debug('Default fields created for ' + s.entity + ' in app ' + s.app);
			})
			.catch(err => {
				logger.error(err);
			});
	});
	return Promise.all(promises)
		.then(() => {
			logger.info('Total number of documents updated in batch ' + count);
		});
}

function addingFieldsPM(srvc) {
	var count = 0;
	var promises = srvc.map(s => {
		let newFields = JSON.stringify(pmRole.fields);
		let newroles = pmRole.roles;
		return mongoose.model('roles').update({ '_id': s._id }, { $set: { 'fields': newFields, 'roles': newroles, '_metadata.version.release': release } })
			.then(_d => {
				logger.debug({ _d });
				count++;
				logger.debug('Default fields created for ' + s.entity + ' in app ' + s.app);
			})
			.catch(err => {
				logger.error(err);
			});
	});
	return Promise.all(promises)
		.then(() => {
			logger.info('Total number of documents updated in batch ' + count);
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

/*function initialize() {
	let dataStackNS = config.dataStackNS;
	if (!(dataStackNS && config.isK8sEnv())) return Promise.resolve();
	logger.info('Updating namespace');
	return mongoose.model('app').find({}).lean(true)
		.then(apps => {
			let promises = apps.map(doc => {
				const ns = dataStackNS + '-' + doc._id.toLowerCase().replace(/ /g, '');
				return kubeutil.namespace.getNamespace(ns)
					.then(data => {
						if (data) {
							logger.info('data is' + JSON.stringify(data));

							if (data.body.spec.selector.release != release) {
								return kubeutil.namespace.editNameSpace(ns, release);
							}
						}
						return data;
					})
					.then(data => {
						if (data) {
							return mongoose.model('app').update({ '_id': doc._id }, { '_metadata.version.release': release });
						}
					});
			});
			return Promise.all(promises);
		})
		.then(() => {
			return createNS();
		})
		.catch(err => {
			logger.debug(err.message);
		});
}*/

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

function fixUsersAttributeInNewRelease() {
	logger.debug('Fixing Users Attribute');
	return mongoose.model('user').find({ attributes: { $exists: true, $ne: null }, release: { $ne: release } })
		.then(users => {
			logger.debug('Users found ' + users.length);
			let promises = users.map(_user => {
				if (_user.attributes) {
					let newAttr = {};
					Object.keys(_user.attributes).forEach(_k => {
						if (_user.attributes[_k] == null) {
							newAttr[_k.toLowerCase()] = {
								type: 'String',
								value: _user.attributes[_k],
								label: _k
							};
						}
						else if (_user.attributes[_k].type == undefined) {
							newAttr[_k.toLowerCase()] = {
								type: _.capitalize(typeof _user.attributes[_k]),
								value: _user.attributes[_k],
								label: _k
							};
						} else {
							newAttr[_k] = _user.attributes[_k];
						}
					});
					_user.attributes = newAttr;
					return _user.save();
				} else {
					return Promise.resolve();
				}
			});
			return Promise.all(promises);
		})
		.then(() => {
			logger.debug('Fixied Users Attribute');
		})
		.catch(err => {
			logger.error(err);
		});
}

function getData(model, filter, page, batchSize) {
	page = (page === 0) ? 0 : page * batchSize;
	return model.find(filter).skip(page).limit(batchSize).toArray();
}

function splitInBatches(count, batchSize) {
	let totalBatches = count / batchSize;
	let arr = [];
	for (let i = 0; i < totalBatches; i++) {
		arr.push(i);
	}
	return arr;
}

function fixUserInDocument(path, doc, mapping) {
	let pathArr = path.split('.');
	let key = pathArr.shift();
	if (!doc || !doc[key]) return doc;
	if (pathArr.length == 0) {
		if (Array.isArray(doc[key])) doc[key] = doc[key].map(_u => mapping[_u] ? mapping[_u] : _u);
		else if (typeof doc[key] == 'string') doc[key] = mapping[doc[key]] ? mapping[doc[key]] : doc[key];
	} else {
		if (Array.isArray(doc[key])) {

			doc[key] = doc[key].map(_d => {
				fixUserInDocument(pathArr.join('.'), _d, mapping);
			});
		}
		else if (doc[key].constructor == {}.constructor) {
			doc[key] = fixUserInDocument(pathArr.join('.'), doc[key], mapping);
		}
	}
	return doc;
}

function userMigrationAppcenter(batchSize, _document) {
	let logArray = [];
	let migrationDB = mongoose.connection.db.collection('migration');
	//let migrationDBFilter = { $and: [{ 'release': '3.8' }, { 'module': 'USER' }, { 'allServices': false }, { 'services.0': { $exists: true, $gte: { $size: 1 } } }] };
	return new Promise((resolve, reject) => {
		logger.info('config.mongoUrlAppcenter --- ', config.mongoUrlAppcenter);
		mongo.connect(config.mongoUrlAppcenter, {
			db: config.mongoAppcenterOptions
		}, (error, db) => {
			if (error) {
				logger.info('mongo error -- ', error);
				logger.error(error.message);
				reject(error);
			}
			if (db) {
				global.appcenterDbo = db;
				resolve();
				logger.info('Connected to Appcenter DB');
				db.on('connecting', () => { logger.info('--------Appcenter DB Connecting--------'); });
				db.on('close', () => { logger.error('--------Appcenter DB Lost Connection---------'); });
				db.on('reconnect', () => { logger.info('----------Appcenter DB Reconnected----------'); });
				db.on('connected', () => { logger.info('--------Appcenter DB Connected--------'); });
				db.on('reconnectFailed', () => { logger.error('---------Appcenter DB failed to reconnect---------'); });
			}
		});
	})
		//.then(() => migrationDB.find(migrationDBFilter))	//update if condition here instead from migration collection
		.then(() => {
			let appcenterData = _document.checklist.services;
			let userMapping = _document.userMapping;
			let userList = Object.keys(userMapping);
			let promises = appcenterData.map(obj => {
				if (obj.migrated) return Promise.resolve();
				let ns = (config.dataStackNS) ? config.dataStackNS : 'odp';
				let dbName = ns + '-' + obj.app;
				logger.info('Appcenter dbName  -->  ', dbName);
				return obj.relatedSchemas.reduce((acc, schemaObj) => {
					let parsedKey = Object.keys(JSON.parse(schemaObj.filter))[0];
					let appcenterFilter = { [parsedKey]: { $in: userList } };
					let appcenterCollection = global.appcenterDbo.db(dbName).collection(obj.collectionName);
					return acc
						.then(() => appcenterCollection.count(appcenterFilter))
						.then(count => {
							logger.info('Appcenter -- ' + dbName + ' : ' + obj.collectionName + ' -- Total documents to be fixed - ' + count);
							logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'Appcenter -- ' + dbName + ' : ' + obj.collectionName + ' -- Total documents to be fixed - ' + count });
							let arr = splitInBatches(count, batchSize);
							return arr.reduce((_p, curr, i) => {
								return _p
									.then(() => {
										logger.info('Appcenter -- ' + dbName + ' : ' + obj.collectionName + ' -- Running batch --> ' + (i + 1));
										logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'Appcenter -- ' + dbName + ' : ' + obj.collectionName + ' -- Running batch --> ' + (i + 1) });
										return getData(appcenterCollection, appcenterFilter, 0, batchSize);
									})
									.then(batchData => {
										let batchPromises = batchData.map(_data => {
											let finalDoc = fixUserInDocument(parsedKey, _data, userMapping);
											return appcenterCollection.update({ _id: _data._id }, finalDoc);
										});
										logger.info('Appcenter -- ' + dbName + ' : ' + obj.collectionName + ' -- Completed updates for batch ' + (i + 1));
										logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'Appcenter -- ' + dbName + ' : ' + obj.collectionName + ' -- Completed updates for batch ' + (i + 1) });
										return Promise.all(batchPromises);
									});
							}, Promise.resolve());
						});
				}, Promise.resolve())
					.then(() => {
						return migrationDB.findOneAndUpdate({ 'release': '3.8', 'module': 'USER', 'checklist.services.serviceId': obj.serviceId }, { $set: { 'checklist.services.$.migrated': true }, $push: { 'migrationLogs': logArray } });
					});
			});
			return Promise.all(promises);
		})
		.then(() => {
			migrationDB.find({ 'checklist.services': { $elemMatch: { 'migrated': true } } }).toArray()
				.then(migratedData => {
					if (migratedData)
						return migrationDB.findOneAndUpdate({ 'release': '3.8', 'module': 'USER' }, { $set: { 'checklist.allServices': true } });
				});
		})
		.catch(err => {
			logger.error(err);
		});
}

function userMigrationServiceModel(batchSize) {
	let migrationDB = mongoose.connection.db.collection('migration');
	let logArray = [];
	let filter = { 'relatedSchemas.internal.users.0': { $gte: { $size: 1 } } };
	let serviceArr = [];
	return mongoose.connection.db.collection('services').count(filter)
		.then((count) => {
			logger.info('SERVICES MODEL -- Total documents to be fixed - ' + count);
			logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'SERVICES MODEL -- Total documents to be fixed - ' + count });
			let arr = splitInBatches(count, batchSize);
			return arr.reduce((_p, curr, i) => {
				return _p
					.then(() => {
						logger.info('SERVICES MODEL -- Running batch --> ' + (i + 1));
						logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'SERVICES MODEL -- Running batch --> ' + (i + 1) });
						return getData(mongoose.connection.db.collection('services'), filter, curr, batchSize);
					})
					.then(batchData => {
						serviceArr = batchData.map(service => {
							let obj = {
								app: service.app,
								serviceId: service._id,
								collectionName: service.collectionName,
								relatedSchemas: service.relatedSchemas.internal.users,
								migrated: false
							};
							return obj;
						});
						logger.info('SERVICES MODEL -- Completed updates for batch ' + (i + 1));
						logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'SERVICES MODEL -- Completed updates for batch ' + (i + 1) });
						return migrationDB.findOneAndUpdate({ 'release': '3.8', 'module': 'USER' }, { $push: { 'checklist.services': { $each: serviceArr } } });
					});
			}, Promise.resolve());
		})
		.then(() => {
			logger.info('SERVICES MODEL -- All appcenter services fetched!!');
			logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'SERVICES MODEL -- All appcenter services fetched!!' });
			return migrationDB.findOneAndUpdate({ 'release': '3.8', 'module': 'USER' }, { $push: { 'migrationLogs': logArray } });
		})
		.then(() => {
			return serviceArr;
		})
		.catch(err => {
			logger.error(err);
		});
}

function userMigrationGroupsModel(batchSize, _document) {
	let migrationDB = mongoose.connection.db.collection('migration');
	let logArray = [];
	if (!_document) {
		return;
	}
	let userMapping = _document.userMapping;
	let userList = Object.keys(userMapping);
	let groupsFilter = { $and: [{ 'users': { $exists: true } }, { 'users.0': { $exists: true } }, { 'users': { $in: userList } }] };	// check $ememMatch property for users query
	let model = mongoose.model('group');
	return model.count(groupsFilter)
		.then((count) => {
			logger.info('USER GROUPS MODEL -- Total documents to be fixed - ' + count);
			logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'USER GROUPS MODEL -- Total documents to be fixed - ' + count });
			let arr = splitInBatches(count, batchSize);
			return arr.reduce((_p, curr, i) => {
				return _p
					.then(() => {
						logger.info('USER GROUPS MODEL -- Running batch --> ' + (i + 1));
						logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'USER GROUPS MODEL -- Running batch --> ' + (i + 1) });
						return getData(mongoose.connection.db.collection('userMgmt.groups'), groupsFilter, 0, batchSize);
					})
					.then(batchData => {
						let promises = batchData.map(_grp => {
							if (_grp.users && Array.isArray(_grp.users)) {
								_grp.users = _grp.users.map(_u => userMapping[_u] ? userMapping[_u] : _u);
							}
							return mongoose.connection.db.collection('userMgmt.groups').update({ _id: _grp._id }, _grp);
						});
						logger.info('USER GROUPS MODEL -- Completed _id updates for batch ' + (i + 1));
						logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'USER GROUPS MODEL -- Completed _id updates for batch ' + (i + 1) });
						return Promise.all(promises);
					});
			}, Promise.resolve());
		})
		.then(() => {
			logger.info('USER GROUPS MODEL -- Migration Complete!!');
			logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'USER GROUPS MODEL -- Migration Complete!!' });
			return migrationDB.findOneAndUpdate({ 'release': '3.8', 'module': 'USER' }, { $set: { 'checklist.groups': true } }, { $push: { 'migrationLogs': logArray } });
		})
		.catch(err => {
			logger.error(err);
		});
}

function userMigrationPreferencesModel(batchSize, _document) {
	let migrationDB = mongoose.connection.db.collection('migration');
	let logArray = [];
	if (!_document) {
		return;
	}
	let userMapping = _document.userMapping;
	let userList = Object.keys(userMapping);
	let model = mongoose.model('preference');
	let filter = { 'userId': { $in: userList } };
	return model.count(filter)
		.then((count) => {
			logger.info('USER PREFERENCES MODEL -- Total documents to be fixed - ' + count);
			logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'USER PREFERENCES MODEL -- Total documents to be fixed - ' + count });
			let arr = splitInBatches(count, batchSize);
			return arr.reduce((_p, curr, i) => {
				return _p
					.then(() => {
						logger.info('USER PREFERENCES MODEL -- Running batch --> ' + (i + 1));
						logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'USER PREFERENCES MODEL -- Running batch --> ' + (i + 1) });
						return getData(mongoose.connection.db.collection('userMgmt.preferences'), filter, 0, batchSize);
					})
					.then(batchData => {
						let promises = batchData.map(obj => {
							if (obj.userId) {
								obj.userId = userMapping[obj.userId] ? userMapping[obj.userId] : obj.userId;
							}
							return mongoose.connection.db.collection('userMgmt.preferences').update({ _id: obj._id }, obj);
						});
						logger.info('USER PREFERENCES MODEL -- Completed updates for batch ' + (i + 1));
						logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'USER PREFERENCES MODEL -- Completed updates for batch ' + (i + 1) });
						return Promise.all(promises);
					});
			}, Promise.resolve());
		})
		.then(() => {
			logger.info('USER PREFERENCES MODEL -- Migration Complete!!');
			logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'USER PREFERENCES MODEL -- Migration Complete!!' });
			return migrationDB.findOneAndUpdate({ 'release': '3.8', 'module': 'USER' }, { $set: { 'checklist.preferences': true } }, { $push: { 'migrationLogs': logArray } });
		})
		.catch(err => {
			logger.error(err);
		});
}

function userMigrationBookmarkModel(batchSize, _document) {
	let migrationDB = mongoose.connection.db.collection('migration');
	let logArray = [];

	if (!_document) {
		return;
	}
	let userMapping = _document.userMapping;
	let userList = Object.keys(userMapping);
	let model = mongoose.model('bookmark');
	let filter = { 'createdBy': { $in: userList } };
	return model.count(filter)
		.then((count) => {
			logger.info('USER BOOKMARK MODEL -- Total documents to be fixed - ' + count);
			logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'USER BOOKMARK MODEL -- Total documents to be fixed - ' + count });
			let arr = splitInBatches(count, batchSize);
			return arr.reduce((_p, curr, i) => {
				return _p
					.then(() => {
						logger.info('USER BOOKMARK MODEL -- Running batch --> ' + (i + 1));
						logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'USER BOOKMARK MODEL -- Running batch --> ' + (i + 1) });
						return getData(mongoose.connection.db.collection('userMgmt.bookmark'), filter, 0, batchSize);
					})
					.then(batchData => {
						let promises = batchData.map(obj => {
							if (obj.createdBy) {
								obj.createdBy = userMapping[obj.createdBy] ? userMapping[obj.createdBy] : obj.createdBy;
							}
							return mongoose.connection.db.collection('userMgmt.bookmark').update({ _id: obj._id }, obj);
						});
						return Promise.all(promises)
							.then(() => {
								logger.info('USER BOOKMARK MODEL -- Completed updates for batch ' + (i + 1));
								logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'USER BOOKMARK MODEL -- Completed updates for batch ' + (i + 1) });
							});
					});
			}, Promise.resolve());
		})
		.then(() => {
			logger.info('USER BOOKMARK MODEL -- Migration Complete!!');
			logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'USER BOOKMARK MODEL -- Migration Complete!!' });
			return migrationDB.findOneAndUpdate({ 'release': '3.8', 'module': 'USER' }, { $set: { 'checklist.bookmark': true } }, { $push: { 'migrationLogs': logArray } });
		})
		.catch(err => {
			logger.error(err);
		});
}

function userMigrationFilterModel(batchSize, _document) {
	let migrationDB = mongoose.connection.db.collection('migration');
	let logArray = [];
	if (!_document) {
		return;
	}

	let userMapping = _document.userMapping;
	let userList = Object.keys(userMapping);
	let model = mongoose.model('userMgmt.filter');
	let filter = { 'createdBy': { $in: userList } };
	return model.count(filter)
		.then((count) => {
			logger.info('USER FILTER MODEL -- Total documents to be fixed - ' + count);
			logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'USER FILTER MODEL -- Total documents to be fixed - ' + count });
			let arr = splitInBatches(count, batchSize);
			return arr.reduce((_p, curr, i) => {
				return _p
					.then(() => {
						logger.info('USER FILTER MODEL -- Running batch --> ' + (i + 1));
						logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'USER FILTER MODEL -- Running batch --> ' + (i + 1) });
						return getData(mongoose.connection.db.collection('userMgmt.filter'), filter, 0, batchSize);
					})
					.then(batchData => {
						let promises = batchData.map(obj => {
							if (obj.createdBy) {
								obj.createdBy = userMapping[obj.createdBy] ? userMapping[obj.createdBy] : obj.createdBy;
							}
							return mongoose.connection.db.collection('userMgmt.filter').update({ _id: obj._id }, obj);
						});
						logger.info('USER FILTER MODEL -- Completed updates for batch ' + (i + 1));
						logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'USER FILTER MODEL -- Completed updates for batch ' + (i + 1) });
						return Promise.all(promises);
					});
			}, Promise.resolve());
		})
		.then(() => {
			logger.info('USER FILTER MODEL -- Migration Complete!!');
			logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'USER FILTER MODEL -- Migration Complete!!' });
			return migrationDB.findOneAndUpdate({ 'release': '3.8', 'module': 'USER' }, { $set: { 'checklist.filter': true } }, { $push: { 'migrationLogs': logArray } });
		})
		.catch(err => {
			logger.error(err);
		});
}

function userMigrationWorkflowModel(batchSize, _document) {
	let migrationDB = mongoose.connection.db.collection('migration');
	let logArray = [];
	if (!_document) {
		return;
	}

	let userMapping = _document.userMapping;
	let userList = Object.keys(userMapping);
	let filter = { 'requestedBy': { $in: userList }, 'audit.id': { $in: userList } };
	return mongoose.connection.db.collection('workflow').count(filter)
		.then((count) => {
			logger.info('WORKFLOW MODEL -- Total documents to be fixed - ' + count);
			logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'WORKFLOW MODEL -- Total documents to be fixed - ' + count });
			let arr = splitInBatches(count, batchSize);
			return arr.reduce((_p, curr, i) => {
				return _p
					.then(() => {
						logger.info('WORKFLOW MODEL -- Running batch --> ' + (i + 1));
						logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'WORKFLOW MODEL -- Running batch --> ' + (i + 1) });
						return getData(mongoose.connection.db.collection('workflow'), filter, 0, batchSize);		//needs to be updated
					})
					.then(batchData => {
						let promises = batchData.map(_wf => {
							let requestedBy = _wf.requestedBy;
							_wf.requestedBy = userMapping[requestedBy] ? userMapping[requestedBy] : requestedBy;
							if (_wf.audit && Array.isArray(_wf.audit)) {
								_wf.audit.forEach(_u => {
									_u.id = userMapping[_u.id] ? userMapping[_u.id] : _u.id;
								});
							}
							return mongoose.connection.db.collection('workflow').update({ _id: _wf._id }, _wf);
						});
						return Promise.all(promises)
							.then(()=> {
								logger.info('WORKFLOW MODEL -- Completed updates for batch ' + (i + 1));
								logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'WORKFLOW MODEL -- Completed updates for batch ' + (i + 1) });
							});
					});
			}, Promise.resolve());
		})
		.then(() => {
			logger.info('WORKFLOW MODEL -- Migration Complete!!');
			logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'WORKFLOW MODEL -- Migration Complete!!' });
			return migrationDB.findOneAndUpdate({ 'release': '3.8', 'module': 'USER' }, { $set: { 'checklist.wf': true } }, { $push: { 'migrationLogs': logArray } });
		})
		.catch(err => {
			logger.error(err);
		});
}

function userMigrationUserModel(batchSize) {
	let model = mongoose.model('user');
	let filter = { $or: [{ '_metadata.oldUserId': { $exists: false } }, { '_metadata.oldUserId': null }], '_metadata.deleted': false };
	let logArray = [];
	return (mongoose.connection.db.collection('userMgmt.users').dropIndex('username_1').catch(er => logger.error(er.message)))
		.then(() => {
			return model.count(filter);
		})
		.then((count) => {
			logger.info('USER MODEL -- Total documents to be fixed - ' + count);
			logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'USER MODEL -- Total documents to be fixed - ' + count });
			let arr = splitInBatches(count, batchSize);
			//let creationIDs = [];
			return arr.reduce((_p, curr, i) => {
				return _p
					.then(() => {
						logger.info('USER MODEL -- Running batch -- ' + (i + 1));
						logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'USER MODEL -- Running batch -- ' + (i + 1) });
						//console.log(JSON.stringify({ filter, curr, batchSize }));
						return getData(mongoose.connection.db.collection('userMgmt.users'), filter, 0, batchSize);
					})
					.then(batchData => {
						let promises = batchData.map(obj => {
							let newObj = JSON.parse(JSON.stringify(obj));
							if (!newObj._metadata) newObj._metadata = {};
							newObj._metadata.oldUserId = obj._id;
							newObj._id = newObj.username;
							// let markDeleteFlag = true;
							let promise = Promise.resolve();
							if (newObj._id == obj._id) {
								promise = mongoose.connection.db.collection('userMgmt.users').update({ _id: obj._id }, newObj).catch(err => {
									logger.error(err.message);
								})
									.then(() => {
										return true;
									});
							}
							else {
								promise = mongoose.connection.db.collection('userMgmt.users').insert(newObj).catch(err => {
									logger.error(err.message);
								});
							}
							return promise
								.then((alreadyUpdated) => {
									if (obj._metadata) {
										// creationIDs.push(newObj._id);
										obj._metadata.deleted = true;
									}
									// if (errorFlag == true) {
									// 	console.log(newObj._id + ' Already created');
									// 	if (!obj._metadata) obj._metadata = {};
									// 	obj._metadata.oldUserId = obj._id;
									// }
									if (alreadyUpdated !== true) return mongoose.connection.db.collection('userMgmt.users').update({ _id: obj._id }, obj);
								})
								.catch(err => {
									logger.error(err);
								});
						});
						return Promise.all(promises)
							.then(() => {
								logger.info('USER MODEL -- Completed _id updates for batch ' + (i + 1));
								logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'USER MODEL -- Completed _id updates for batch ' + (i + 1) });
							});
					});
			}, Promise.resolve())
				.then(() => {
					//console.log(JSON.stringify({ creationIDs }));
					logger.info('Deleting old user documents..');
					logArray.push({ 'logTimestamp': new Date(), 'logMessage': 'Deleting old user documents..' });
					return mongoose.connection.db.collection('userMgmt.users').deleteMany({ $and: [{ '_metadata.deleted': true }, { '_metadata.oldUserId': { $exists: false } }] })
						.then(() => { return logArray; });
				});
		})
		.catch(err => {
			logger.error(err);
		});
}

function userMigration() {
	let batchSize = 100;
	let migrationDoc = null;
	let migrationChecklist = null;
	let userMapping = {};
	let migrationDB = mongoose.connection.db.collection('migration');
	return migrationDB.findOne({ 'release': '3.8', 'module': 'USER' })
		.then((doc) => {
			migrationDoc = doc;
			if (!migrationDoc) return userMigrationUserModel(batchSize);
		})
		.then((logArray) => {
			let filterForMapping = { $and: [{ '_metadata.oldUserId': { $exists: true } }, { '_metadata.oldUserId': { $ne: null } }] };
			return mongoose.connection.db.collection('userMgmt.users').find(filterForMapping, { _id: 1, '_metadata.oldUserId': 1 }).toArray()
				.then((migrationDocuments) => {
					migrationDocuments.forEach(obj => {
						userMapping[obj._metadata.oldUserId] = obj._id;
					});
					let collectionbody = {
						release: '3.8',
						module: 'USER',
						checklist: {
							user: true,
							wf: false,
							preferences: false,
							groups: false,
							bookmark: false,
							filter: false,
							allServices: false,
							services: []
						},
						userMapping: userMapping,
						migrationLogs: (logArray) ? logArray : []
					};
					let mongoDBColl = mongoose.connection.db.collection('migration');
					return mongoDBColl.update({ release: '3.8', module: 'USER' }, collectionbody, { upsert: true })
						.then(() => { return collectionbody; })
						.catch(err => {
							logger.error(err);
						});
				});
		})
		.then((collectionbody) => {
			migrationChecklist = collectionbody.checklist;
			migrationDoc = collectionbody;
			if (!migrationChecklist.groups) return userMigrationGroupsModel(batchSize, migrationDoc);
		})
		.then(() => {
			if (!migrationChecklist.bookmark) return userMigrationBookmarkModel(batchSize, migrationDoc);
		})
		.then(() => {
			if (!migrationChecklist.filter) return userMigrationFilterModel(batchSize, migrationDoc);
		})
		.then(() => {
			if (!migrationChecklist.preferences) return userMigrationPreferencesModel(batchSize, migrationDoc);
		})
		.then(() => {
			if (!migrationChecklist.wf) return userMigrationWorkflowModel(batchSize, migrationDoc);
		})
		.then(() => {
			if (/*migrationChecklist.services.length > 0 &&*/ !migrationChecklist.allServices) {
				return userMigrationServiceModel(batchSize)
					.then((serviceArr) => {
						migrationDoc.checklist.services = serviceArr;
						userMigrationAppcenter(batchSize, migrationDoc);
					});
				// appcenter collections will still be calling migration based on filter conditions
			}
		})
		.catch(err => {
			logger.error(err);
		});
}

function removeAuthMode(authMode, err) {
	logger.error(`Removing auth mode ${authMode} due to error :: `, err);
	config.RBAC_USER_AUTH_MODES = config.RBAC_USER_AUTH_MODES.filter(mode => mode != authMode);
}

function validateAuthModes() {
	let authModes = config.RBAC_USER_AUTH_MODES;
	logger.debug('validating auth modes :: ', authModes);
	let validationArray = authModes.map(mode => {
		if(mode == 'azure')
			return validateAzureCredentials({
				tenant: process.env.AZURE_B2C_TENANT,
				clientId: process.env.AZURE_CLIENT_ID,
				clientSecret: process.env.AZURE_CLIENT_SECRET
			}).catch((err) => removeAuthMode('azure', err));
		else if(mode == 'ldap')
			return validateLdapCredentials(config.ldapDetails)
				.catch((err) => removeAuthMode('ldap', err));
		else if(mode == 'local') 
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

function init() {
	return checkDependency()
		.then(() => createNS())
		.then(() => createPMrole())
		.then(() => createNSrole())
		.then(() => createSecurityKeys())
		.then(() => fixSMRolesinNewRelease())
		.then(() => fixPMRolesinNewRelease())
		.then(() => fixGSRolesinNewRelease())
		.then(() => fixUsersAttributeInNewRelease())
		.then(() => fixGroupRolesinNewRelease())
		.then(() => userMigration())
		.then(() => validateAuthModes());
}

module.exports = init;
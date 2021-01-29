'use strict';

const mongoose = require('mongoose');
const definition = require('../helpers/roles.definition.js').definition;
const SMCrud = require('@appveen/swagger-mongoose-crud');
const utils = require('@appveen/utils');
const _ = require('lodash');
const schema = new mongoose.Schema(definition);
const logger = global.logger;
let queueMgmt = require('../../util/queueMgmt');
var client = queueMgmt.client;
const dataStackUtils = require('@appveen/data.stack-utils');
const rolesHelper = require('../helpers/util/rolesHooks.js');
var options = {
	logger: logger,
	collectionName: 'userMgmt.roles'
};

schema.index({ entity: 1, app: 1 }, { unique: true });

schema.pre('save', function (next, _req) {
	this._wasNew = this.isNew;
	this._req = _req;
	let self = this;
	if (self.roles) {
		if (self.roles.some(_r => _r.description && _r.description > 250)) {
			next(new Error('Description size cannot be more than 250 character.'));
		}
	}
	next();
});


schema.pre('save', utils.counter.getIdGenerator('PRM', 'roles', null, null, 1000));

// To check is SKIP_REVIEW role is present
schema.pre('save', function (next) {
	let self = this;
	if (self.roles) {
		const skipReview = self.roles.find(r => r.operations.find(o => o.method === 'SKIP_REVIEW'));
		if (!skipReview && self.type == 'appcenter') {
			self.roles.unshift(rolesHelper.getSkipReviewRole(self));
		}
	}
	next();
});

schema.pre('save', function (next) {
	let self = this;
	if (self._metadata.version) {
		self._metadata.version.release = process.env.RELEASE;
	}
	next();
});

function validateFields(fields, validRoles) {
	Object.keys(fields).forEach(key => {
		if (fields[key] != null && typeof fields[key] == 'object') {
			if (fields[key]['_p'] != null && typeof fields[key]['_p'] == 'object') {
				fields[key]['_p'] = _.pick(fields[key]['_p'], validRoles);
			} else {
				validateFields(fields[key], validRoles);
			}
		}
	});
}

schema.pre('save', function (next) {
	let self = this;
	if (!self.roles || !self.roles) return next();
	let validRoles = self.roles.map(obj => obj.id);
	let fields = JSON.parse(self.fields);
	validateFields(fields, validRoles);
	self.fields = JSON.stringify(fields);
	if (!self.isNew) {
		crudder.model.findOne({ _id: self._id })
			.then(_d => {
				self._oldData = _d.toObject();
				next();
			})
			.catch(err => {
				logger.error(err.message);
				next();
			});
	} else {
		next();
	}
});

schema.pre('save', function (next) {
	let self = this;
	if (self.roles) {
		let rname = self.roles.map(obj => obj.name.toLowerCase());
		if (_.uniq(rname).length != (rname).length) {
			next(new Error('Role name already in use'));
		}
		else {
			next();
		}
	} else {
		next();
	}

});

schema.pre('save', function (next) {
	let self = this;
	if (self.roles) {
		let des = self.roles.map(obj => obj.description);
		des.forEach(str => {
			if (str && str.length > 250) {
				next(new Error('Role description should not be more than 250 character. '));
			}
		});
		next();
	} else {
		next();
	}

});

schema.pre('save', dataStackUtils.auditTrail.getAuditPreSaveHook('userMgmt.roles'));

schema.post('save', dataStackUtils.auditTrail.getAuditPostSaveHook('userMgmt.roles.audit', client, 'auditQueue'));

// schema.post('save', rolesHelper.createRolesPostHook());

schema.post('save', rolesHelper.updateRolesHook());

schema.pre('remove', dataStackUtils.auditTrail.getAuditPreRemoveHook());

schema.post('remove', dataStackUtils.auditTrail.getAuditPostRemoveHook('userMgmt.apps.audit', client, 'auditQueue'));

schema.pre('remove', function (next, _req) {
	this._req = _req;
	next();
});

schema.post('remove', rolesHelper.deleteRolesHook());

var crudder = new SMCrud(schema, 'roles', options);

function init() {
	let roles = require('../../config/roles.js');
	roles = JSON.parse(JSON.stringify(roles));
	return new Promise((resolve) => {
		crudder.model.find({}).count()
			.then(_c => {
				if (_c === 0) {
					let promiseArr = roles.map(obj => {
						if (obj.fields) obj.fields = JSON.stringify(obj.fields);
						return crudder.model.create(obj);
					});
					return Promise.all(promiseArr);
				}
			})
			.then(createdDefs => {
				if (createdDefs) {
					createdDefs.map(defs => logger.info('Added role :: ' + defs.entityName + ' on App' + defs.app));
				}
				resolve();
			})
			.catch(err => {
				logger.error(err.message);
			});
	});
}
const MongoType = ['String', 'Number', 'Date', 'Boolean', 'Array'];

function createDefinition(schema, definition, idList, isNestedId) {
	schema.forEach(attribute => {
		let key = attribute.key;
		if (!(!isNestedId && key === '_id')) {
			if (attribute['type'] && attribute['type'] == 'Object') {
				definition[key] = {};
				createDefinition(attribute['definition'], definition[key], idList, true);
			} else {
				if (attribute['type'] && MongoType.indexOf(attribute['type']) > -1) {
					definition[key] = {};
					definition[key]['_t'] = attribute['type'];
				} else if (attribute['type']) {
					definition[key] = {};
					definition[key]['_t'] = 'String';
				}
				definition[key]['_p'] = {};
				idList.forEach(id => {
					definition[key]['_p'][id] = 'R';
				});
			}
		}
	});
}
/*
function getUsrMgmtDefinition(serviceObj, readId, writeId) {
	let permObj = [
		{
            "skipReviewRole" : true,
            "id" : "P"+utils.rand(10),
            "name" : "Skip Review "+serviceObj.entityName,
            "operations" : [ 
                {
                    "method" : "SKIP_REVIEW"
                }, 
                {
                    "method" : "POST"
                }, 
                {
                    "method" : "PUT"
                }, 
                {
                    "method" : "DELETE"
                }, 
                {
                    "method" : "GET"
                }
            ],
            "description" : "This role entitles an authorized user to create, update or delete a record and without any approval"
        },
		{
			'id': writeId, 'name': 'Manage ' + serviceObj.entityName,
			'operations': [
				{ method: 'POST' },
				{ method: 'PUT' },
				{ method: 'DELETE' },
				{ method: 'GET' }
			],
			'description': 'This role entitles an authorized user to create, update or delete a record'
		},
		{
			'id': readId, 'name': 'View ' + serviceObj.entityName,
			'operations': [{ method: 'GET' }],
			'description': 'This role entitles an authorized user to view the record'
		}
	];

	let usrMgmtDefinitionObj = {
		'_id': serviceObj.entity,
		'app': serviceObj.app,
		'entity': serviceObj.entity,
		'entityName': serviceObj.entityName,
		'roles': permObj,
		'default': 'R'
	};
	let initFields = {
		'_id': { '_t': 'String' },
		'_metadata': {
			'deleted': { '_t': 'Boolean' },
			'lastUpdated': { '_t': 'String' },
			'createdAt': { '_t': 'String' },
			'version': {
				'document': { '_t': 'Number' },
				'service': { '_t': 'Number' },
				'odp': { '_t': 'Number' }
			}
		},
		'__v': { '_t': 'Number' }

	};
	addPermissionObj(initFields, readId, writeId);
	initFields['_id']['_p'][writeId] = 'R';
	createDefinition(JSON.parse(serviceObj.definition), initFields, readId, writeId, false);
	usrMgmtDefinitionObj.fields = initFields;
	return usrMgmtDefinitionObj;
}
*/
function getUsrMgmtDefinition(serviceObj, idList) {
	let usrMgmtDefinitionObj = {
		'_id': serviceObj.entity,
		'app': serviceObj.app,
		'entity': serviceObj.entity,
		'entityName': serviceObj.entityName,
		'default': 'R'
	};
	let initFields = {
		'_id': { '_t': 'String' },
		'_metadata': {
			'deleted': { '_t': 'Boolean' },
			'lastUpdated': { '_t': 'String' },
			'createdAt': { '_t': 'String' },
			'version': {
				'document': { '_t': 'Number' },
				'service': { '_t': 'Number' },
				'odp': { '_t': 'Number' }
			}
		},
		'__v': { '_t': 'Number' }

	};
	addPermissionObj(initFields, idList);
	createDefinition(serviceObj.definition, initFields, idList, false);
	usrMgmtDefinitionObj.fields = initFields;
	return usrMgmtDefinitionObj;
}


function addPermissionObj(obj, idList) {
	Object.keys(obj).forEach(_k => {
		if (obj[_k]['_t']) {
			obj[_k]['_p'] = {};
			idList.forEach(id => {
				obj[_k]['_p'][id] = 'R';
			});
		} else {
			addPermissionObj(obj[_k], idList);
		}
	});
}
/*
function customCreate(_req, _res) {
	let readId = 'P' + utils.rand(10);
	let writeId = 'P' + utils.rand(10);
	let usrMgmtDefinitionObj = getUsrMgmtDefinition(_req.body, readId, writeId);
	usrMgmtDefinitionObj.fields = JSON.stringify(usrMgmtDefinitionObj.fields);
	let doc = new crudder.model(usrMgmtDefinitionObj);
	doc.save(_req)
		.then(_d => {
			_res.json(_d);
		})
		.catch(err => {
			logger.error(err);
			_res.status(500).json({ message: err });
		});
}

function customUpdate(_req, _res) {
	_req.body.fields = _req.body.fields ? JSON.stringify(_req.body.fields) : _req.body.fields;
	crudder.update(_req, _res);
}
*/
function mergePermission(newPerm, oldPerm) {
	let netPermission = JSON.parse(JSON.stringify(newPerm));
	let prevPerm = oldPerm ? oldPerm['_p'] : null;
	Object.keys(newPerm).forEach(key => {
		if (newPerm[key] != null && typeof newPerm[key] == 'object') {
			if (newPerm[key]['_p']) {
				netPermission[key]['_p'] = oldPerm && oldPerm[key] && oldPerm[key]['_p'] ? oldPerm[key]['_p'] : (prevPerm ? prevPerm : newPerm[key]['_p']);
				if (oldPerm && oldPerm[key] && oldPerm[key]['_p']) prevPerm = oldPerm[key]['_p'];
			} else {
				netPermission[key] = newPerm[key] ? mergePermission(newPerm[key], oldPerm ? oldPerm[key] : null) : oldPerm[key];
			}
		}
	});
	return netPermission;
}
/*
function changeRolesDefinition(_req, _res) {
	crudder.model.findOne({ '_id': _req.body.entity })
		.then(_d => {
			let oldUsrMgmtDefinitionObj = _d;
			let readId = oldUsrMgmtDefinitionObj.roles.find(obj => obj.name === (oldUsrMgmtDefinitionObj.entityName + ' Read'));
			readId = readId ? readId.id : null;
			let writeId = oldUsrMgmtDefinitionObj.roles.find(obj => obj.name === (oldUsrMgmtDefinitionObj.entityName + ' Write'));
			writeId = writeId ? writeId.id : null;
			let newUsrMgmtDefinitionObj = getUsrMgmtDefinition(_req.body, readId, writeId);
			let netPermission = mergePermission(newUsrMgmtDefinitionObj.fields, JSON.parse(oldUsrMgmtDefinitionObj.fields));
			oldUsrMgmtDefinitionObj.fields = JSON.stringify(netPermission);
			oldUsrMgmtDefinitionObj.roles = oldUsrMgmtDefinitionObj.roles.map(obj => {
				if (obj.name === 'View ' + oldUsrMgmtDefinitionObj.entityName) {
					obj.name = 'View ' + _req.body.entityName;
				}
				if (obj.name === 'Manage ' + oldUsrMgmtDefinitionObj.entityName) {
					obj.name = 'Manage ' + _req.body.entityName;
				}
				return obj;
			});
			oldUsrMgmtDefinitionObj.entityName = _req.body.entityName;
			return oldUsrMgmtDefinitionObj.save(_req);
		})
		.then(_d => {
			_res.json(_d);
		})
		.catch(err => {
			logger.error(err);
			_res.status(500).json({ message: err });
		});
}
*/


function changeRolesDefinition(_req, _res) {
	crudder.model.findOne({ '_id': _req.body.entity })
		.then(_d => {
			let oldUsrMgmtDefinitionObj = _d;
			// let readId = oldUsrMgmtDefinitionObj.roles.find(obj => obj.name === (oldUsrMgmtDefinitionObj.entityName + ' Read'));
			// readId = readId ? readId.id : null;
			// let writeId = oldUsrMgmtDefinitionObj.roles.find(obj => obj.name === (oldUsrMgmtDefinitionObj.entityName + ' Write'));
			// writeId = writeId ? writeId.id : null;
			let idList = oldUsrMgmtDefinitionObj.roles.map(_r => _r._id);
			let newUsrMgmtDefinitionObj = getUsrMgmtDefinition(_req.body, idList);
			let netPermission = mergePermission(newUsrMgmtDefinitionObj.fields, JSON.parse(oldUsrMgmtDefinitionObj.fields));
			oldUsrMgmtDefinitionObj.fields = JSON.stringify(netPermission);
			// oldUsrMgmtDefinitionObj.roles = oldUsrMgmtDefinitionObj.roles.map(obj => {
			// 	if (obj.name === 'View ' + oldUsrMgmtDefinitionObj.entityName) {
			// 		obj.name = 'View ' + _req.body.entityName;
			// 	}
			// 	if (obj.name === 'Manage ' + oldUsrMgmtDefinitionObj.entityName) {
			// 		obj.name = 'Manage ' + _req.body.entityName;
			// 	}
			// 	return obj;
			// });
			// oldUsrMgmtDefinitionObj.entityName = _req.body.entityName;
			return oldUsrMgmtDefinitionObj.save(_req);
		})
		.then(_d => {
			_res.json(_d);
		})
		.catch(err => {
			logger.error(err);
			_res.status(500).json({ message: err });
		});
}

function getRoleName(req, res) {
	let app = req.swagger.params.app ? req.swagger.params.app.value : null;
	let id = req.swagger.params.id ? req.swagger.params.id.value : null;
	let entity = req.swagger.params.entity ? req.swagger.params.entity.value : null;
	crudder.model.findOne({ 'app': app, 'entity': entity, 'roles.id': id }, 'roles')
		.then(_rs => {
			if (_rs) {
				let rObj = _rs.roles ? _rs.roles.find(_r => _r.id === id) : null;
				if (rObj) return res.status(200).json({ name: rObj.name });
				return res.status(404).json({ message: 'Role not found' });
			} else {
				res.status(404).json({ message: 'Role not found' });
			}
		})
		.catch(err => logger.error(err.message));
}

function reviewPermission(req, res) {
	let appName = req.swagger.params.app.value;
	crudder.model.find({ app: { $eq: appName }, 'roles.operations.method': 'REVIEW' })
		.then(services => { res.status(200).json(services); })
		.catch(err => { res.status(500).json({ 'message': err.message }); });
}

function reviewPermissionService(req, res) {
	let entity = req.swagger.params.entity.value;
	let user = req.swagger.params.user.value;
	let filter = { entity: { $eq: entity }, 'roles.operations.method': 'REVIEW' };
	crudder.model.find(filter)
		.then((services) => {
			if (services[0] != null) {
				if (user) {
					const grpModel = mongoose.model('group');
					grpModel.find({ users: user }).then(_grps => {
						const skipRole = services[0].roles.find(r => r.operations.find(o => o.method === 'SKIP_REVIEW'));
						let allRoles = [];
						_grps.forEach(_grp => {
							if (_grp.roles) {
								allRoles = allRoles.concat(_grp.roles);
							}
						});
						if (skipRole && allRoles.find(r => r.id === skipRole.id)) {
							res.status(404).json({ 'message': 'User has skip review permission' });
						} else res.status(200).json({ 'message': 'Service has role with review permission' });
					}).catch(err => { res.status(500).json({ 'message': err.message }); });
				} else {
					res.status(200).json({ 'message': 'Service has role with review permission' });
				}
			}
			else {
				res.status(404).json({ 'message': 'Service has no role with review permission' });
			}
		})
		.catch(err => { res.status(500).json({ 'message': err.message }); });
}

function fixRoles(req) {
	logger.debug('old reqBody ' + JSON.stringify(req.body));
	let definition = req.body.definition;
	let promise = Promise.resolve(req.body);
	if (!req.body.roles) {
		promise = crudder.model.findOne({ 'entity': req.body.entity });
	}
	return promise.then(rolesObj => {
		if (definition && rolesObj) {
			delete req.body.definition;
			let roles = req.body.roles ? req.body.roles : rolesObj.roles;
			if (!roles) return;
			let idList = roles.map(_r => _r.id);
			let initFields = {
				'_id': { '_t': 'String' }
			};
			addPermissionObj(initFields, idList);
			createDefinition(definition, initFields, idList, false);
			let fields = req.body.fields ? req.body.fields : rolesObj.fields;
			// console.log(JSON.stringify(initFields, null, 2));
			let netPermission = mergePermission(initFields, JSON.parse(fields));
			req.body.fields = JSON.stringify(netPermission);
		}
	});
}

function customCreate(req, res) {
	fixRoles(req)
		.then(() => {
			return crudder.create(req, res);
		})
		.catch(err => {
			logger.error(err.message);
			res.status(500).json({ message: err.message });
		});

}

function customUpdate(req, res) {
	fixRoles(req)
		.then(() => {
			logger.debug('new reqBody ' + JSON.stringify(req.body));
			return crudder.update(req, res);
		})
		.catch(err => {
			logger.error(err);
			res.status(500).json({ message: err.message });
		});
}

module.exports = {
	init: init,
	create: customCreate,
	index: crudder.index,
	show: crudder.show,
	destroy: crudder.destroy,
	update: customUpdate,
	changeRolesDefinition: changeRolesDefinition,
	getRoleName: getRoleName,
	reviewPermission: reviewPermission,
	reviewPermissionService: reviewPermissionService
};
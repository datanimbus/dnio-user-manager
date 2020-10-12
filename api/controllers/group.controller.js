'use strict';

const mongoose = require('mongoose');
const definition = require('../helpers/group.definition.js').definition;
const SMCrud = require('@appveen/swagger-mongoose-crud');
const schema = new mongoose.Schema(definition);
const logger = global.logger;
const utils = require('@appveen/utils');
const odpUtils = require('@appveen/odp-utils');
let queueMgmt = require('../../util/queueMgmt');
let groupLog = require('./insight.group.controller');
var client = queueMgmt.client;
const _ = require('lodash');
var options = {
	logger: logger,
	collectionName: 'userMgmt.groups'
};

schema.index({ name: 1, app: 1 });

schema.pre('validate', function (next) {
	if (this.name.length > 40) {
		next(new Error('Entity name must be less than 40 characters. '));
	} else {
		next();
	}
});

schema.pre('validate', function (next) {
	if (this.description && this.description.length > 250) {
		next(new Error('Entity description should not be more than 250 character '));
	} else {
		next();
	}
});

schema.pre('save', utils.counter.getIdGenerator('GRP', 'group', null, null, 1000));

schema.pre('save', function (next) {
	let self = this;
	if (!self.users) self.users = [];
	self.users = _.uniq(self.users);
	next();
});

schema.pre('save', function (next) {
	let nameRegex = new RegExp('^' + this.name + '$', 'i');
	let filter = { 'app': this.app, 'name': nameRegex };
	this.wasNew = this.isNew;
	if (!this.isNew) {
		filter['_id'] = { $ne: this._id };
	}
	return crudder.model.findOne(filter).lean(true)
		.then(_d => {
			if (_d) {
				return next(new Error('Group name already in use'));
			}
			next();
		})
		.catch(next);
});

// To check if Users in group valid or not
schema.pre('save', function (next) {
	let users = _.uniq(this.users);
	if (users) {
		return mongoose.model('user').find({ _id: { $in: users } }, '_id')
			.then(_u => {
				if (_u.length != users.length) {
					let invalidUsr = _.difference(users, _u.map(_o => _o._id));
					next(new Error('Users with ' + invalidUsr + ' not found'));
				} else {
					next();
				}
			})
			.catch(err => {
				next(err);
			});
	} else {
		next();
	}
});

schema.pre('save', function (next) {
	let self = this;
	if (self.roles && self.roles.some(_r => _r.app != self.app)) {
		next(new Error('Roles of other app cannot be added'));
	} else {
		next();
	}
});

schema.pre('save', function (next, req) {
	let self = this;
	this._req = req;
	if (self._metadata.version) {
		self._metadata.version.release = process.env.RELEASE;
	}
	next();
});

schema.pre('save', odpUtils.auditTrail.getAuditPreSaveHook('userMgmt.groups'));

schema.post('save', odpUtils.auditTrail.getAuditPostSaveHook('userMgmt.groups.audit', client, 'auditQueue'));

schema.post('save', groupLog.create());

schema.post('save', groupLog.updateGroup());

schema.post('save', function(doc) {
	let eventId;
	if(doc.wasNew)
		eventId = 'EVENT_GROUP_CREATE';
	else
		eventId = 'EVENT_GROUP_UPDATE';
	odpUtils.eventsUtil.publishEvent(eventId, 'group', doc._req, doc);

});
schema.pre('remove', odpUtils.auditTrail.getAuditPreRemoveHook());
schema.pre('remove', function(next, req) {
	this._req = req;
	next();
});

schema.post('remove', odpUtils.auditTrail.getAuditPostRemoveHook('userMgmt.groups.audit', client, 'auditQueue'));

schema.post('remove', groupLog.deleteGroup());

schema.post('remove', function(doc) {
	odpUtils.eventsUtil.publishEvent('EVENT_GROUP_DELETE', 'group', doc._req, doc);
});

schema.post('remove', function (doc) {
	return mongoose.model('app').find({ 'groups': doc._id })
		.then(_apps => {
			logger.debug('mongoose.model(\'app\').find({ \'groups\': doc._id })');
			logger.debug(_apps);
			if (_apps) {
				let promises = _apps.map(app => {
					app.groups = app.groups.filter(_u => _u != doc._id);
					return app.save(doc._req);
				});
				return Promise.all(promises);
			}
		})
		.then(docs => {
			logger.debug(JSON.stringify(docs));
			if (docs) {
				logger.info('Removed group from ' + docs.map(_d => _d._id) + ' app');
			}
		})
		.catch(err => {
			logger.error(err.message);
		});
});

var crudder = new SMCrud(schema, 'group', options);

function customUpdate(req, res) {
	delete req.body.app;
	logger.debug('Update Group ' + JSON.stringify(req.body));
	crudder.update(req, res);
}

function modifyFilterForApp(req) {
	let filter = req.swagger.params.filter.value;
	let app = req.swagger.params.app.value;
	if (filter && typeof filter === 'string') {
		filter = JSON.parse(filter);
	}
	if (filter && typeof filter === 'object') {
		filter.app = app;
	} else {
		filter = { app };
	}
	req.swagger.params.filter.value = JSON.stringify(filter);
}

function groupInApp(req, res) {
	modifyFilterForApp(req);
	crudder.index(req, res);
}
function groupInAppCount(req, res) {
	modifyFilterForApp(req);
	crudder.count(req, res);
}

module.exports = {
	create: crudder.create,
	index: crudder.index,
	show: crudder.show,
	destroy: crudder.destroy,
	update: customUpdate,
	count: crudder.count,
	groupInApp: groupInApp,
	groupInAppCount: groupInAppCount
};
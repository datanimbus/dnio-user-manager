'use strict';

const mongoose = require('mongoose');
const definition = require('../helpers/preferences.definition.js').definition;
const SMCrud = require('@appveen/swagger-mongoose-crud');
const utils = require('@appveen/utils');
const schema = new mongoose.Schema(definition);
let queueMgmt = require('../../util/queueMgmt');
var client = queueMgmt.client;
const logger = global.logger;
const dataStackUtils = require('@appveen/data.stack-utils');

var options = {
	logger: logger,
	collectionName: 'userMgmt.preferences'
};
schema.index({ userId: 1, key: 1 });
schema.pre('save', utils.counter.getIdGenerator('PREF', 'preference', null, null, 1000));
schema.pre('save', function (next) {
	let queryUser = { '_id': this.userId };
	mongoose.models['user'].findOne(queryUser).select({ _id: 1 })
		.then(x => {
			if (x !== null) {
				next();
			} else {
				next(new Error('There is no such user'));
			}
		})
		.catch(err => {
			next(err);
		});
});

schema.pre('save', function (next) {
	let self = this;
	if (self._metadata.version) {
		self._metadata.version.release = process.env.RELEASE;
	}
	next();
});

schema.pre('save', dataStackUtils.auditTrail.getAuditPreSaveHook('userMgmt.preferences'));

schema.post('save', dataStackUtils.auditTrail.getAuditPostSaveHook('userMgmt.preferences.audit', client, 'auditQueue'));

schema.pre('remove', dataStackUtils.auditTrail.getAuditPreRemoveHook());

schema.post('remove', dataStackUtils.auditTrail.getAuditPostRemoveHook('userMgmt.apps.audit', client, 'auditQueue'));

var crudder = new SMCrud(schema, 'preference', options);


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

function modifyBodyForApp(req) {
	let app = req.swagger.params.app.value;
	req.body.app = app;
}


function customCreate(req, res) {
	modifyBodyForApp(req);
	crudder.create(req, res);
}
function customIndex(req, res) {
	modifyFilterForApp(req);
	crudder.index(req, res);
}
function customShow(req, res) {
	modifyFilterForApp(req);
	crudder.show(req, res);
}
function customDestroy(req, res) {
	modifyBodyForApp(req);
	crudder.destroy(req, res);
}
function customUpdate(req, res) {
	modifyBodyForApp(req);
	crudder.update(req, res);
}


module.exports = {
	create: customCreate,
	index: customIndex,
	show: customShow,
	destroy: customDestroy,
	update: customUpdate
};
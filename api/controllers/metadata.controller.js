'use strict';

const definition = require('../helpers/metadata-formulas.definition').definition;
const { SMCrud, MakeSchema } = require('@appveen/swagger-mongoose-crud');
const utils = require('@appveen/utils');
const schema = MakeSchema(definition);
let queueMgmt = require('../../util/queueMgmt');
var client = queueMgmt.client;
const logger = global.logger;
const dataStackUtils = require('@appveen/data.stack-utils');
const config = require('../../config/config');

var options = {
	logger: logger,
	collectionName: 'metadata.mapper.formulas'
};

schema.index({ name: 1, app: 1 }, { unique: true, name: 'UNIQUE_INDEX', collation: { locale: 'en', strength: 2 } });
schema.index({ returnType: 1 });

schema.pre('save', utils.counter.getIdGenerator('FX', 'metadata.mapper.formulas', null, null, 1000));

schema.pre('save', function (next) {
	let self = this;
	if (self._metadata.version) {
		self._metadata.version.release = config.RELEASE;
	}
	next();
});

schema.pre('save', dataStackUtils.auditTrail.getAuditPreSaveHook('metadata.mapper.formulas'));

schema.post('save', dataStackUtils.auditTrail.getAuditPostSaveHook('metadata.mapper.formulas.audit', client, 'auditQueue'));

schema.pre('remove', dataStackUtils.auditTrail.getAuditPreRemoveHook());

schema.post('remove', dataStackUtils.auditTrail.getAuditPostRemoveHook('metadata.mapper.formulas.audit', client, 'auditQueue'));

schema.post('save', function (error, doc, next) {
	if (error.code == 11000) {
		next(new Error('Formula name is already in use'));
	} else if ((error.errors && error.errors.name) || error.name === 'ValidationError' && error.message.indexOf('UNIQUE_INDEX') > -1) {
		next(new Error('Formula name is already in use'));
	} else {
		next(error);
	}
});

var crudder = new SMCrud(schema, 'metadata.mapper.formulas', options);


function modifyFilterForApp(req) {
	let filter = req.query.filter;
	let app = req.params.app;
	if (filter && typeof filter === 'string') {
		filter = JSON.parse(filter);
	}
	if (filter && typeof filter === 'object') {
		filter.app = app;
	} else {
		filter = { app };
	}
	req.query.filter = JSON.stringify(filter);
}

function modifyBodyForApp(req) {
	let app = req.params.app;
	req.body.app = app;
}

function customCount(req, res) {
	modifyBodyForApp(req);
	crudder.count(req, res);
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
	count: crudder.count,
	create: crudder.create,
	index: crudder.index,
	show: crudder.show,
	destroy: crudder.destroy,
	update: crudder.update,
	app: {
		count: customCount,
		create: customCreate,
		index: customIndex,
		show: customShow,
		destroy: customDestroy,
		update: customUpdate
	}
};
'use strict';

const definition = require('../helpers/metadata-formulas.definition').definition;
const { SMCrud, MakeSchema } = require('@appveen/swagger-mongoose-crud');
const utils = require('@appveen/utils');
const schema = MakeSchema(definition);
let queueMgmt = require('../../util/queueMgmt');
var client = queueMgmt.client;
const logger = global.logger;
const dataStackUtils = require('@appveen/data.stack-utils');

var options = {
	logger: logger,
	collectionName: 'metadata.mapper.formulas'
};
schema.index({ name: 1 });
schema.index({ name: 1, app: 1 }, { unique: true, name: 'UNIQUE_INDEX', collation: { locale: 'en', strength: 2 } });
schema.pre('save', utils.counter.getIdGenerator('PREF', 'metadata.mapper.formulas', null, null, 1000));

schema.pre('save', function (next) {
	let self = this;
	if (self._metadata.version) {
		self._metadata.version.release = process.env.RELEASE;
	}
	next();
});

schema.pre('save', dataStackUtils.auditTrail.getAuditPreSaveHook('metadata.mapper.formulas'));

schema.post('save', dataStackUtils.auditTrail.getAuditPostSaveHook('metadata.mapper.formulas.audit', client, 'auditQueue'));

schema.pre('remove', dataStackUtils.auditTrail.getAuditPreRemoveHook());

schema.post('remove', dataStackUtils.auditTrail.getAuditPostRemoveHook('metadata.mapper.formulas.audit', client, 'auditQueue'));

var crudder = new SMCrud(schema, 'metadata.mapper.formulas', options);


function modifyFilterForApp(req) {
	let filter = req.query.filter;
	let userId = req.user._id;
	if (filter && typeof filter === 'string') {
		filter = JSON.parse(filter);
	}
	if (filter && typeof filter === 'object') {
		filter.userId = userId;
	} else {
		filter = { userId };
	}
	req.query.filter = JSON.stringify(filter);
}

// function modifyBodyForApp(req) {
// 	let app = req.params.app;
// 	req.body.app = app;
// }


function customCreate(req, res) {
	// modifyBodyForApp(req);
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
	// modifyBodyForApp(req);
	crudder.destroy(req, res);
}
function customUpdate(req, res) {
	// modifyBodyForApp(req);
	crudder.update(req, res);
}


module.exports = {
	count: crudder.count,
	create: customCreate,
	index: customIndex,
	show: customShow,
	destroy: customDestroy,
	update: customUpdate
};
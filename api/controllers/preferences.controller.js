'use strict';

const mongoose = require('mongoose');
const definition = require('../helpers/preferences.definition.js').definition;
const { SMCrud, MakeSchema } = require('@appveen/swagger-mongoose-crud');
const utils = require('@appveen/utils');
const schema = MakeSchema(definition);
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
async function customUpdate(req, res) {
	if (req.body.userId !== req.user._id) {
		return res.status(403).json({ "message": "You don't have permissions for this API"});
	}
	
	let data =  await crudder.model.findOne({ "_id": req.params.id }).lean();
	if (data.userId !== req.body.userId || data.userId !== req.user._id) {
		return res.status(400).json({ "message": "You can't manipulate preferences for another user." })
	}

	data =  await crudder.model.findOneAndUpdate({ "_id": req.params.id }, req.body).lean();
	if (data) {
		return res.status(200).json(data);
	} else {
		return res.status(404).json({ message: 'Preferences not found' });
	}
}


module.exports = {
	create: customCreate,
	index: customIndex,
	show: customShow,
	destroy: customDestroy,
	update: customUpdate
};
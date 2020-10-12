'use strict';

const mongoose = require('mongoose');
const definition = require('../helpers/preferences.definition.js').definition;
const SMCrud = require('@appveen/swagger-mongoose-crud');
const utils = require('@appveen/utils');
const schema = new mongoose.Schema(definition);
let queueMgmt = require('../../util/queueMgmt');
var client = queueMgmt.client;
const logger = global.logger;
const odpUtils = require('@appveen/odp-utils');

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

schema.pre('save', odpUtils.auditTrail.getAuditPreSaveHook('userMgmt.preferences'));

schema.post('save', odpUtils.auditTrail.getAuditPostSaveHook('userMgmt.preferences.audit',client,'auditQueue'));

schema.pre('remove', odpUtils.auditTrail.getAuditPreRemoveHook());

schema.post('remove', odpUtils.auditTrail.getAuditPostRemoveHook('userMgmt.apps.audit',client,'auditQueue'));

var crudder = new SMCrud(schema, 'preference', options);
module.exports = {
	create: crudder.create,
	index: crudder.index,
	show: crudder.show,
	destroy: crudder.destroy,
	update: crudder.update
};
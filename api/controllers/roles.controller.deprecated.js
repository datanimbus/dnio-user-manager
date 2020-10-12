/*
'use strict';

const mongoose = require('mongoose');
const definition = require('../helpers/roles.definition.js').definition;
const SMCrud = require('@appveen/swagger-mongoose-crud');
const utils = require('@appveen/utils');
const odpUtils = require('@appveen/odp-utils');
const schema = new mongoose.Schema(definition, {
	usePushEach: true
});
const logger = global.logger;

var options = {
	logger: logger,
	collectionName: 'userMgmt.roles'
};

schema.index({
	name: 1,
	app: 1
}, {
	unique: true
});
schema.index({ name: 1, app: 1 }, { unique: '__CUSTOM_NAME_DUPLICATE_ERROR__' });

schema.post('save', function (error, doc, next) {
	if (error.errors.name || error.code == 11000 ) {
		next(new Error('Role name is already in use'));
	} else {
		next(error);
	}
});
schema.pre('save', function (next) {
	if (this.permissions!=null) {
		next();
	} else {
		next(new Error('Enter the Permission field'));
	}
});

schema.pre('save', utils.counter.getIdGenerator('R', 'roles', null, null, 1000));

schema.pre('save', odpUtils.auditTrail.getAuditPreSaveHook('userMgmt.roles'));

schema.post('save', odpUtils.auditTrail.getAuditPostSaveHook('userMgmt.roles.audit'));

schema.pre('remove', odpUtils.auditTrail.getAuditPreRemoveHook());

schema.post('remove', odpUtils.auditTrail.getAuditPostRemoveHook('userMgmt.roles.audit'));

schema.post('remove', function (doc) {
	mongoose.model('user').find({ 'roles': doc._id })
		.then((docs) => {
			let promises = docs.map(_d => {
				_d.roles = _d.roles.filter(_k => _k != doc._id);
				return _d.save(doc._req);
			});
			return Promise.all(promises);
		})
		.catch(err=>{
			logger.error(err.message);
		});
});

schema.pre('save', function (next) {
	let queryApp = {
		'_id': this.app
	};
	mongoose.model('app').findOne(queryApp).select({
		_id: 1
	})
		.then(x => {
			if (!x) {
				next(new Error('There is no such app'));
			} else {
				next();
			}
		})
		.catch(err => {
			next(err);
		});
});

function init() {
	let roles = require('../../config/roles.js');
	return new Promise((_resolve, _reject) => {
		crudder.model.find({}).count()
			.then(_d => {
				if (_d == 0) {
					return roles.reduce((_p, _c) => {
						return _p.then(()=> crudder.model.create(_c))
							.then(_d => logger.info('Added role :: ' + _d.name + ' on app ' + _d.app))
							.catch(err => {
								logger.error('Error adding role :: ' + err.message);
							});
					}, new Promise(_r => _r()))
						.then(() => _resolve());
				} else _resolve();
			}, () => _reject());
	});
}



var crudder = new SMCrud(schema, 'role', options);
module.exports = {
	init: init,
	create: crudder.create,
	index: crudder.index,
	show: crudder.show,
	destroy: crudder.destroy,
	update: crudder.update
};
*/
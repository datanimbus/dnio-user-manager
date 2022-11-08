'use strict';

const { SMCrud, MakeSchema } = require('@appveen/swagger-mongoose-crud');
const dataStackUtils = require('@appveen/data.stack-utils');
const utils = require('@appveen/utils');
const _ = require('lodash');

const definition = require('../helpers/connectors.definition').definition;
const availableConnectors = require('../helpers/connectors.list').data;
const queueMgmt = require('../../util/queueMgmt');
const client = queueMgmt.client;
let appHook = require('../helpers/util/appHooks');
const config = require('../../config/config');
const { default: mongoose } = require('mongoose');
// const metadataDefinition = require('../helpers/connectors.metadata.definition').definition;

const schema = MakeSchema(definition);
// const metadataSchema = MakeSchema(metadataDefinition);
const logger = global.logger;

const options = {
	logger: logger,
	collectionName: 'config.connectors'
};

// const optionsMetadata = {
// 	logger: logger,
// 	collectionName: 'config.connectors.metadata'
// };

schema.index({ name: 1, app: 1 }, { unique: 'Connector Exists with same Name and Type', collation: { locale: 'en', strength: 2 } });
schema.index({ category: 1, type: 1 });
// metadataSchema.index({ type: 1 });

schema.pre('save', utils.counter.getIdGenerator('CON', 'connectors', null, null, 1000));

schema.pre('save', function (next) {
	let self = this;
	if (self._metadata.version) {
		self._metadata.version.release = process.env.RELEASE;
	}
	next();
});

schema.pre('save', function (next) {
	let self = this;
	if (self._doc?.options?.default && self._doc?.name !== 'Default DB Connector' && self._doc?.name !== 'Default File Connector') {
		delete self._doc.options.default;
	}
	next();
});

schema.pre('save', function (next) {
	const idregex = '^[a-zA-Z0-9 ]*$';
	if (!this.name.match(idregex)) {
		next(new Error('Connector name must consist of alphanumeric characters .'));
	}
	else if (this.name.length > 40) {
		next(new Error('Connector name cannot be greater than 40'));
	}
	next();
});

// schema.pre('save', function (next) {
// 	let nameRegex = new RegExp('^' + this.name + '$', 'i');
// 	let filter = { 'app': this.app, 'name': nameRegex };
// 	this.wasNew = this.isNew;
// 	if (!this.isNew) {
// 		filter['_id'] = { $ne: this._id };
// 	}
// 	return crudder.model.findOne(filter).lean(true)
// 		.then(_d => {
// 			if (_d) {
// 				return next(new Error('Connector name already in use'));
// 			}
// 			next();
// 		})
// 		.catch(next);
// });

schema.pre('save', function (next) {
	if (!this.isNew && this._doc?.options?.default) {
		return next(new Error('Cannot update default connector'));
	}
	next();
});

schema.pre('remove', function (next) {
	let self = this;
	if (self._doc?.options?.default) {
		return next(new Error('Cannot delete default connector'));
	}
	next();
});

schema.pre('remove', function (next) {
	let qs = { filter: JSON.stringify({ 'app': this._doc.app }) };

	appHook.sendRequest(config.baseUrlSM + `/${this._doc.app}/service`, 'GET', qs, null, this._req).then((services) => {
		logger.info('Services :: ', services);
		let service;
		if (this._doc.category === 'DB') {
			service = _.find(services, services?.connectors?.data?._id === this._doc._id);
		} else {
			service = _.find(services, services?.connectors?.file?._id === this._doc._id);
		}
		if (service) {
			return next(new Error('Cannot delete connector while it is in use by a data service'));
		}
		next();
	}).catch(err => {
		logger.error('Error in fetching services for App ' + this._doc.app, err);
		return next(new Error('Error fetching services list for app'));
	});	
});


schema.pre('remove', function (next) {
	mongoose.model('app').find({ _id: this._doc.app }).then((app) => {
		logger.info('App details :: ', app);
		
		if (app.connectors?.data?._id === this._doc._id || app.connectors?.file?._id === this._doc._id) {
			return next(new Error('Cannot delete connector while it is set as default for app'));
		}
		next();
	}).catch(err => {
		logger.error('Error in fetching App ' + this._doc.app, err);
		return next(new Error('Error fetching app details'));
	});	
});


schema.pre('save', dataStackUtils.auditTrail.getAuditPreSaveHook('config.connectors'));
schema.post('save', dataStackUtils.auditTrail.getAuditPostSaveHook('config.connectors.audit', client, 'auditQueue'));
schema.pre('remove', dataStackUtils.auditTrail.getAuditPreRemoveHook());
schema.post('remove', dataStackUtils.auditTrail.getAuditPostRemoveHook('config.connectors.audit', client, 'auditQueue'));


schema.post('save', function (error, doc, next) {
	if (error.errors && error.errors._id || error.code == 11000 || error._id === 'ValidationError' && error.message.indexOf('__CUSTOM_ID_DUPLICATE_ERROR__') > -1) {
		logger.error(error);
		next(new Error('Connector name is already in use'));
	} else {
		next(error);
	}
});
const crudder = new SMCrud(schema, 'config.connectors', options);
// const metadataCrudder = new SMCrud(metadataSchema, 'config.connectors.metadata', optionsMetadata);


async function listOptions(req, res) {
	res.json(availableConnectors);
}


module.exports = {
	listOptions: listOptions,
	count: crudder.count,
	create: crudder.create,
	index: crudder.index,
	show: crudder.show,
	destroy: crudder.destroy,
	update: crudder.update,
	// metadataIndex: metadataCrudder.index,
	// metadataShow: metadataCrudder.show,
};
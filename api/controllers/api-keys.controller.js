'use strict';
const crypto = require('crypto');
const JWT = require('jsonwebtoken');
const { SMCrud, MakeSchema } = require('@appveen/swagger-mongoose-crud');
const dataStackUtils = require('@appveen/data.stack-utils');
const utils = require('@appveen/utils');
const _ = require('lodash');

const definition = require('../helpers/api-keys.definition').definition;
const queueMgmt = require('../../util/queueMgmt');
const config = require('../../config/config');

const schema = MakeSchema(definition);
const logger = global.logger;
const client = queueMgmt.client;
const options = {
	logger: logger,
	collectionName: 'userMgmt.apiKeys'
};

function md5(data) {
	return crypto.createHash('md5').update(data).digest('hex');
}

schema.index({ name: 1, app: 1, status: 1 });
schema.index({ name: 1, app: 1 }, { unique: true, name: 'UNIQUE_INDEX', collation: { locale: 'en', strength: 2 } });

schema.pre('validate', function (next) {
	const idregex = '^[a-zA-Z0-9 -]*$';
	if (!this.name.match(idregex)) {
		return next(new Error('Connector name must consist of alphanumeric characters .'));
	} else if (this.name.length > 40) {
		return next(new Error('Connector name cannot be greater than 40'));
	} else if (!this.expiryAfter) {
		return next(new Error('Expire After is Required'));
	}
	next();
});

schema.pre('save', utils.counter.getIdGenerator('API', 'apiKeys', null, null, 1000));

schema.pre('save', function (next) {
	const tempdate = new Date();
	tempdate.setDate(tempdate.getDate() + this.expiryAfter);
	this._expiryAfterDate = tempdate;
	next();
});

schema.virtual('apiKey').get(function () {
	return this.__apiKey;
}).set(function (val) {
	this.__apiKey = val;
});

schema.pre('save', function (next) {
	const tempKey = JWT.sign({ name: this.name, _id: _.camelCase(this.name) }, config.RBAC_JWT_KEY, { expiresIn: this.expiryAfter + ' days' });
	this.apiKey = tempKey;
	this.tokenHash = md5(tempKey);
	next();
});

schema.pre('save', function (next, req) {
	let self = this;
	this._req = req;
	if (self._metadata.version) {
		self._metadata.version.release = process.env.RELEASE;
	}
	const headers = {};
	if (req && req.rawHeaders) {
		const headersLen = req.rawHeaders.length;
		for (let index = 0; index < headersLen; index += 2) {
			headers[req.rawHeaders[index]] = req.rawHeaders[index + 1];
		}
	}
	this._req.headers = headers;
	next();
});

schema.pre('save', dataStackUtils.auditTrail.getAuditPreSaveHook('userMgmt.apiKeys'));


schema.post('save', dataStackUtils.auditTrail.getAuditPostSaveHook('userMgmt.apiKeys.audit', client, 'auditQueue'));

schema.post('save', function (doc) {
	let eventId;
	if (doc.wasNew)
		eventId = 'EVENT_APIKEY_CREATE';
	else
		eventId = 'EVENT_APIKEY_UPDATE';
	dataStackUtils.eventsUtil.publishEvent(eventId, 'apikeys', doc._req, doc);
});


schema.pre('remove', dataStackUtils.auditTrail.getAuditPreRemoveHook());

schema.post('remove', dataStackUtils.auditTrail.getAuditPostRemoveHook('userMgmt.apiKeys.audit', client, 'auditQueue'));

schema.post('remove', function (doc) {
	dataStackUtils.eventsUtil.publishEvent('EVENT_APIKEY_DELETE', 'apikeys', doc._req, doc);
});

const crudder = new SMCrud(schema, 'apiKeys', options);


function customCreate(req, res) {
	crudder.create(req, res);
}

function customUpdate(req, res) {
	delete req.body.app;
	logger.debug('Update API Key ' + JSON.stringify(req.body));
	crudder.update(req, res);
}

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

function apiKeyInApp(req, res) {
	modifyFilterForApp(req);
	crudder.index(req, res);
}

function apiKeyInAppShow(req, res) {
	//modifyFilterForApp(req);
	crudder.show(req, res);
}
function apiKeyInAppCount(req, res) {
	modifyFilterForApp(req);
	crudder.count(req, res);
}


async function apiKeyInAppCreate(req, res) {
	try {
		modifyBodyForApp(req);
		const payload = req.body;
		const doc = crudder.model(payload);
		doc._req = req;
		const status = await doc.save(req);
		logger.debug(status);
		const data = status.toObject();
		data.apiKey = status.apiKey;
		res.status(200).json(data);
	} catch (err) {
		res.status(500).json(err);
	}
	// crudder.create(req, res);
}

function apiKeyInAppUpdate(req, res) {
	modifyBodyForApp(req);
	crudder.update(req, res);
}
function apiKeyInAppDestroy(req, res) {
	modifyBodyForApp(req);
	crudder.destroy(req, res);
}

module.exports = {
	create: customCreate,
	index: crudder.index,
	show: crudder.show,
	destroy: crudder.destroy,
	update: customUpdate,
	count: crudder.count,
	apiKeyInApp,
	apiKeyInAppCount,
	apiKeyInAppShow,
	apiKeyInAppCreate,
	apiKeyInAppUpdate,
	apiKeyInAppDestroy
};
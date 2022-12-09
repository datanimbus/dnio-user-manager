'use strict';

const _ = require('lodash');
const { default: mongoose } = require('mongoose');

const utils = require('@appveen/utils');
const restCrud = require('@appveen/rest-crud');
const dataStackUtils = require('@appveen/data.stack-utils');
const { SMCrud, MakeSchema } = require('@appveen/swagger-mongoose-crud');

const config = require('../../config/config');
let appHook = require('../helpers/util/appHooks');
const queueMgmt = require('../../util/queueMgmt');
const client = queueMgmt.client;

const definition = require('../helpers/connectors.definition').definition;
const availableConnectors = require('../helpers/connectors.list').data;

const schema = MakeSchema(definition);
const logger = global.logger;
const options = {
	logger: logger,
	collectionName: 'config.connectors'
};


schema.index({ name: 1, app: 1 }, { unique: true, name: 'UNIQUE_INDEX', collation: { locale: 'en', strength: 2 } });
schema.index({ category: 1, type: 1 });


schema.pre('save', utils.counter.getIdGenerator('CON', 'connectors', null, null, 1000));

schema.pre('save', function (next) {
	let self = this;
	if (self._metadata.version) {
		self._metadata.version.release = process.env.RELEASE;
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

schema.pre('save', function (next) {
	let self = this;
	if (self._doc?.options?.default && self._doc?.name !== 'Default DB Connector' && self._doc?.name !== 'Default File Connector') {
		delete self._doc.options.default;
	}
	if (self.isNew && self._doc?.name !== 'Default DB Connector' && self._doc?.name !== 'Default File Connector') {
		self._doc.options = self._doc.options || {};
		self._doc.options.isValid = false;
	}
	next();
});

schema.pre('save', function (next) {
	if (!this.isNew && this._doc?.options?.default) {
		return next(new Error('Cannot update default connector'));
	}
	next();
});

schema.pre('save', function (next) {
	let connectorDefinition = _.find(availableConnectors, conn => conn.category === this._doc?.category && conn.type === this._doc?.type);
	if (!connectorDefinition) {
		return next(new Error('Connector type not available for selected category'));
	}
	if (!this.isNew) {
		connectorDefinition.fields.forEach(field => {
			if (field.required) {
				if (!this._doc.values[field.key]) {
					return next(new Error(`${field.label} is required`));
				}
			}
		});
		this._doc.options.isValid = true;
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
			service = _.find(services, service => service?.connectors?.data?._id === this._doc._id);
		} else {
			service = _.find(services, service => service?.connectors?.file?._id === this._doc._id);
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
	mongoose.model('app').findOne({ _id: this._doc.app }).lean().then((app) => {
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


schema.post('save', function (error, doc, next) {
	if (error.errors && error.errors._id || error.code == 11000 || error._id === 'ValidationError' && error.message.indexOf('__CUSTOM_ID_DUPLICATE_ERROR__') > -1) {
		logger.error(error);
		next(new Error('Connector name is already in use'));
	} else {
		next(error);
	}
});


schema.pre('save', dataStackUtils.auditTrail.getAuditPreSaveHook('config.connectors'));
schema.post('save', dataStackUtils.auditTrail.getAuditPostSaveHook('config.connectors.audit', client, 'auditQueue'));
schema.pre('remove', dataStackUtils.auditTrail.getAuditPreRemoveHook());
schema.post('remove', dataStackUtils.auditTrail.getAuditPostRemoveHook('config.connectors.audit', client, 'auditQueue'));


const crudder = new SMCrud(schema, 'config.connectors', options);


async function listOptions(req, res) {
	res.json(availableConnectors);
}

async function testConnector(req, res) {
	let payload = req.body;
	try {
		if (payload.type === 'MONGODB') {
			const { MongoClient } = require('mongodb');
			let connection = await MongoClient.connect(payload.values.connectionString);
			connection.db(payload.values.database);

		} else if (payload.type === 'MYSQL' || payload.type === 'PGSQL' || payload.type === 'MSSQL') {
			let sql = restCrud[payload.type.toLowerCase()];
			let crud = await new sql(payload.values);
			await crud.connect();
			await crud.disconnect();

		} else {
			return res.status(500).json({ message: 'Testing not supported for connector type' });
		}

		return res.status(200).json({ message: 'Connection Successful' });
	} catch (err) {
		logger.error(err);
		return res.status(500).json({
			message: err.message
		});
	}
}

async function fetchTables(req, res) {
	try {
		let data = await mongoose.model('config.connectors').findById(req.params.id).lean();
		
		if (data.category === 'DB') {
			let tables = [];
			if (data.type === 'MONGODB') {
				const { MongoClient } = require('mongodb');
				let client = await MongoClient.connect(data.values.connectionString);
				let db = await client.db(data.values.database);

				tables = await db.listCollections().toArray();
				tables = tables.map(table => { return { name: table.name, type: table.type } });

			} else {
				let sql = restCrud[data.type.toLowerCase()];
				let crud = new sql(data.values);
				await crud.connect();

				let tableCheckSql;

				if (data.type === 'MSSQL') {
					tableCheckSql = `SELECT * FROM sysobjects WHERE xtype='U'`;
				} else if (data.type === 'MYSQL') {
					tableCheckSql = `SHOW TABLES`;
				} else if (data.type === 'PGSQL') {
					tableCheckSql = `SELECT * FROM pg_catalog.pg_tables WHERE schemaname='public'`;
				} else {
					return res.status(500).json({ message: 'DB type not supported' });
				}

				let result = await crud.sqlQuery(tableCheckSql);
				await crud.disconnect();

				if (data.type === 'MSSQL') {
					tables = result.recordset.map(record => { return { "name": record.name, "type": record.type } });

				} else if (data.type === 'MYSQL') {
					tables = result[0].map(record => { return { "name": record.Tables_in_testdb } });
	
				} else if (data.type === 'PGSQL') {
					tables = result.rows.map(record => { return { "name": record.tablename } });
				}
			}

			return res.status(200).json(tables);
		} else {
			return res.status(500).json({ message: 'Not a DB connector, can\'t fetch tables' });
		}
	} catch (err) {
		logger.error(err);
		return res.status(500).json({
			message: err.message
		});
	}
}

module.exports = {
	listOptions: listOptions,
	count: crudder.count,
	create: crudder.create,
	index: crudder.index,
	show: crudder.show,
	destroy: crudder.destroy,
	update: crudder.update,
	test: testConnector,
	fetchTables: fetchTables
};

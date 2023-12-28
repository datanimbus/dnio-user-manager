'use strict';

const _ = require('lodash');
const Client = require('ssh2-sftp-client');
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

const { fetchTableSchemaFromMySQL, transformSchemaMySQL } = require('../helpers/connectors/mysql.connector.helper');

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
		self._metadata.version.release = config.RELEASE;
	}
	logger.trace(`Connector Details :: ${JSON.stringify(self._doc)}`);
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
	logger.debug(`Removing default and isValid fields for connector :: ${self._doc.name}`);

	if (self._doc?.options?.default && self._doc?.name !== 'Default DB Connector' && self._doc?.name !== 'Default File Connector') {
		logger.debug(`${self._doc.name} is not a default connector, removing default value`);

		delete self._doc.options.default;
	}

	if (self.isNew && self._doc?.name !== 'Default DB Connector' && self._doc?.name !== 'Default File Connector') {
		logger.debug(`${self._doc.name} is not a default connector, removing isValid value`);

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
	logger.trace(`Connector definition :: ${JSON.stringify(connectorDefinition)}`);

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
	logger.debug(`Checking if connector is in use by a data service :: ${this._doc._id}`);

	appHook.sendRequest(config.baseUrlSM + `/${this._doc.app}/service`, 'GET', qs, null, this._req).then((services) => {
		logger.trace(`Services found for app :: ${JSON.stringify(services)}`);
		let service;
		if (this._doc.category === 'DB') {
			service = _.find(services, service => service?.connectors?.data?._id === this._doc._id);
		} else {
			service = _.find(services, service => service?.connectors?.file?._id === this._doc._id);
		}
		if (service) {
			logger.trace(`Service details :: ${JSON.stringify(service)}`);
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
		logger.trace(`App details :: ${JSON.stringify(app)}`);

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
	try {
		let payload = req.body;

		logger.info(`Testing connector details :: ${JSON.stringify(payload)}`);
		logger.debug(`Connector Type :: ${payload.type}`);

		if (payload.type === 'MONGODB') {
			let connectionString = payload.values.connectionString;
			if ((!connectionString || connectionString == '') && payload.options.default && payload.options.isValid) {

				logger.debug(`Default Connector :: using mongo url from env variables :: ${config.mongoUrlAppcenter}`);
				connectionString = config.mongoUrlAppcenter;
			}
			if (!connectionString.startsWith('mongodb://')) {
				throw new Error("Invalid Scheme, connection string should start with 'mongodb://' or 'mongodb+srv://'");
			}
			if (connectionString.split('//')[1].length < 2) {
				throw new Error("Invalid Scheme, connection string should be atleast of length 2");
			}
			const { MongoClient } = require('mongodb');
			let connection = await MongoClient.connect(connectionString);
			connection.db(payload.values.database);

		} else if (payload.type === 'MYSQL' || payload.type === 'PGSQL' || payload.type === 'MSSQL') {
			let sql = restCrud[payload.type.toLowerCase()];
			let crud = await new sql(payload.values);
			await crud.connect();
			await crud.disconnect();

		} else if (payload.type === 'SFTP') {
			const options = {};
			options.host = payload.values.host;
			options.port = payload.values.port;
			options.username = payload.values.user;
			if (payload.values.authType == 'password') {
				options.password = payload.values.password;
			} else if (payload.values.authType == 'privateKey') {
				options.privateKey = payload.values.privateKey;
				options.passphrase = payload.values.passphrase;
			}
			let sftp = new Client();
			await sftp.connect(options);
		} else {
			return res.status(400).json({ message: 'Testing not supported for connector type' });
		}

		return res.status(200).json({ message: 'Connection Successful' });
	} catch (err) {
		logger.error(err);
		if (err.message && err.message.includes('Server selection timed out')) {
			err.message = 'Unable to connect to server, please check your connection string';
		}
		if (err.code === 'ENOTFOUND') {
			return res.status(400).json({ message: 'Host not found. Please check the connector host configuration.' });
		} else if (err.code === 'ECONNREFUSED') {
			return res.status(400).json({ message: 'Connection refused on the specified port. Please check the connector port configuration.' });
		}
		return res.status(500).json({
			message: err.message
		});
	}
}

async function fetchTables(req, res) {
	try {
		let id = req.params.id;
		logger.info(`Fetching tables for connector :: ${id}`);

		let data = await mongoose.model('config.connectors').findById(id).lean();
		if (!data) {
			return res.status(404).json({ message: `Connector ${id} not found` });
		}
		logger.trace(`Connector details :: ${JSON.stringify(data)}`);
		logger.debug(`Connector Category :: ${data.category} :: :: Connector type :: ${data.type}`);

		if (data.category === 'DB') {
			let tables = [];
			if (data.type === 'MONGODB') {
				let connectionString = data.values.connectionString;
				let database = data.values.database;

				if ((!connectionString || connectionString == '') && data.options.default && data.options.isValid) {

					logger.debug(`Default Connector :: using mongo url from env variables :: ${config.mongoUrlAppcenter}`);
					logger.debug(`Default Connector :: using db name from env variables :: ${config.dataStackNS}-${data.app}`);
					connectionString = config.mongoUrlAppcenter;
					database = config.dataStackNS + '-' + data.app;
				}

				const { MongoClient } = require('mongodb');
				let client = await MongoClient.connect(connectionString);
				let db = await client.db(database);

				tables = await db.listCollections().toArray();

				logger.trace(`Tables fetched from DB :: ${JSON.stringify(tables)}`);

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
					return res.status(400).json({ message: 'DB type not supported' });
				}

				let result = await crud.sqlQuery(tableCheckSql);
				await crud.disconnect();

				logger.trace(`Tables fetched from DB :: ${JSON.stringify(result)}`);

				if (data.type === 'MSSQL') {
					tables = result.recordset.map(record => { return { "name": record.name, "type": record.type } });

				} else if (data.type === 'MYSQL') {
					tables = result[0].map(record => { 
						const dbName = Object.keys(record)[0];
        				return { "name": record[dbName] };
					 });

				} else if (data.type === 'PGSQL') {
					tables = result.rows.map(record => { return { "name": record.tablename } });
				}
			}

			logger.trace(`List of Tables :: ${JSON.stringify(tables)}`);

			return res.status(200).json(tables);
		} else {
			return res.status(400).json({ message: 'Not a DB connector, can\'t fetch tables' });
		}
	} catch (err) {
		logger.error(err);
		if (err.code === 'ENOTFOUND') {
			return res.status(400).json({ message: 'Host not found. Please check the connector host configuration.' });
		} else if (err.code === 'ECONNREFUSED') {
			return res.status(400).json({ message: 'Connection refused on the specified port. Please check the connector port configuration.' });
		}
		return res.status(500).json({
			message: err.message
		});
	}
}

async function fetchTableSchema(req, res){
	try {
		const id = req.params.id;
		const serviceName = req.query.serviceName;
    	const tableName = req.query.tableName;

		const data = await mongoose.model('config.connectors').findById(id).lean();
		if(!data) {
			return res.status(404).json({ message: `Connector ${id} not found` });
		}

		logger.trace(`Connector details :: ${JSON.stringify(data)}`);
		logger.debug(`Connector Category :: ${data.category} :: Connector type :: ${data.type}`);

		if (data.category !== 'DB') {
			return res.status(400).json({ message: 'Not a DB connector, can\'t fetch table schema' });
		}
		
		// TODO: Extend support to other SQL databases
		if (data.type !== 'MYSQL') {
			return res.status(400).json({ message: 'DB type not supported' });
		}

		const schema = await fetchTableSchemaFromMySQL(data, tableName);
		logger.trace(`Schema for table ${tableName} :: ${JSON.stringify(schema)}`);
		const transformedSchema = await transformSchemaMySQL(schema, serviceName);
    	return res.status(200).json(transformedSchema);

	} catch (err) {
		logger.error(err);
		return res.status(500).json({ message: err.message });
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
	fetchTables: fetchTables,
	fetchTableSchema: fetchTableSchema
};

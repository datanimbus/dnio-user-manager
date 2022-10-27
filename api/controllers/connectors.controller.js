'use strict';

const { SMCrud, MakeSchema } = require('@appveen/swagger-mongoose-crud');
const dataStackUtils = require('@appveen/data.stack-utils');
const utils = require('@appveen/utils');

const definition = require('../helpers/connectors.definition').definition;
const availableConnectors = require('../helpers/connectors.list').data;
const queueMgmt = require('../../util/queueMgmt');
const client = queueMgmt.client;
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

schema.index({ name: 1, app: 1, type: 1 }, { unique: 'Connector Exists with same Name and Type', sparse: true, collation: { locale: 'en', strength: 2 } });
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
	const idregex = '^[a-zA-Z0-9 ]*$';
	if (!this.name.match(idregex)) {
		next(new Error('Filter name must consist of alphanumeric characters .'));
	}
	else if (this.name.length > 40) {
		next(new Error('Filter name cannot be greater than 40'));
	}
	next();
});

schema.pre('save', dataStackUtils.auditTrail.getAuditPreSaveHook('config.connectors'));
schema.post('save', dataStackUtils.auditTrail.getAuditPostSaveHook('config.connectors.audit', client, 'auditQueue'));
schema.pre('remove', dataStackUtils.auditTrail.getAuditPreRemoveHook());
schema.post('remove', dataStackUtils.auditTrail.getAuditPostRemoveHook('config.connectors.audit', client, 'auditQueue'));

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
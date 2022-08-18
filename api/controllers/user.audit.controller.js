'use strict';

const mongoose = require('mongoose');
const definition = { 'name': { 'type': 'String' } };
const { SMCrud, MakeSchema } = require('@appveen/swagger-mongoose-crud');
const schema = MakeSchema(definition);
const logger = global.logger;

var options = {
	logger: logger,
	collectionName: 'userMgmt.users.audit'
};

var crudder = new SMCrud(schema, 'userMgmt.users.audit', options);

module.exports = {
	index: crudder.index,
	count: crudder.count
};
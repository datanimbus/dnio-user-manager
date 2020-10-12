/*
'use strict';

const mongoose = require('mongoose');
const definition = {'name': {'type':'String'}};
const SMCrud = require('swagger-mongoose-crud');
const schema = new mongoose.Schema(definition);
const logger = global.logger;

var options = {
	logger: logger,
	collectionName: 'userMgmt.roles.audit'
};

var crudder = new SMCrud(schema, 'userMgmt.roles.audit', options);

module.exports = {
	index: crudder.index,
	count: crudder.count
};
*/
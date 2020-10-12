'use strict';

const mongoose = require('mongoose');
const definition = require('../helpers/config.definition').definition;
const SMCrud = require('@appveen/swagger-mongoose-crud');
const schema = new mongoose.Schema(definition);
const logger = global.logger;
var options = {
	logger: logger,
	collectionName: 'odp.config'
};

schema.pre('save', function(next){
	let self = this;
	if(self._metadata.version){
		self._metadata.version.release = process.env.RELEASE;
	}
	next();
});

var crudder = new SMCrud(schema, 'config', options);

module.exports = {
	index: crudder.index,
	show: crudder.show
};
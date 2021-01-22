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

let queryOptions = {
	resHandler: removeClientSecret
};

schema.pre('save', function(next){
	let self = this;
	if(self._metadata.version){
		self._metadata.version.release = process.env.RELEASE;
	}
	next();
});

function customIndex(req, res) {
	return crudder.index(req, res, queryOptions);
}

function customShow(req, res) {
	return crudder.show(req, res, queryOptions);
}

function removeClientSecret(err, res, config) {
	if(Array.isArray(config)) {
		config = config.map(cfg => {
			if(cfg && cfg.auth && cfg.auth.connectionDetails 
				&& cfg.auth.connectionDetails.clientSecret) {
				delete cfg.auth.connectionDetails.clientSecret;
			}
			return cfg;
		});
	} else {
		if(config && config.auth && config.auth.connectionDetails 
			&& config.auth.connectionDetails.clientSecret) {
			delete config.auth.connectionDetails.clientSecret;
		}
	}
	return config;
}

var crudder = new SMCrud(schema, 'config', options);

module.exports = {
	index: customIndex,
	show: customShow
};
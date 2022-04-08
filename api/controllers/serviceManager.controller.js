const mongoose = require('mongoose');

const definition = require('../helpers/serviceManager.definition').definition;

const schema = new mongoose.Schema(definition, {
	usePushEach: true
});


mongoose.model('services', schema, 'services');
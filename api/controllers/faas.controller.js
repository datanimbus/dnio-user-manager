const mongoose = require('mongoose');

const definition = require('../helpers/faas.definition').definition;

const schema = new mongoose.Schema(definition, {
	usePushEach: true
});


mongoose.model('faas', schema, 'b2b.faas');
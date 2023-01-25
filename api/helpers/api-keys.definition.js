var definition = {
	'_id': {
		'type': 'String'
	},
	'name': {
		'type': 'String',
		'required': true
	},
	'app': {
		'type': 'String',
		'required': true
	},
	'tokenHash': {
		'type': 'String',
		'required': true
	},
	'_metadata': {
		'type': {
			'version': {
				'release': { 'type': 'Number' }
			}
		}
	},
	'status': {
		'type': 'String',
		'required': true
	},
	'expiryAfter': {
		'type': 'Number',
		'required': true,
		'default': 365
	},
	'_expiryAfterDate': {
		'type': 'Date'
	}
};
module.exports.definition = definition;
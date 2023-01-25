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
		'type': 'String'
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
		'required': true,
		'default': 'Enabled',
		'enum': ['Enabled', 'Disabled']
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
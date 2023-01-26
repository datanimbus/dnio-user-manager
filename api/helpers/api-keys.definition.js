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
	'expiryAfterDate': {
		'type': 'Date'
	},
	'roles': {
		'type': [{
			'id': {
				'type': 'String'
			},
			'app': {
				'type': 'String'
			},
			'entity': {
				'type': 'String'
			},
			'type': {
				'type': 'String'
			}
		}]
	}
};
module.exports.definition = definition;
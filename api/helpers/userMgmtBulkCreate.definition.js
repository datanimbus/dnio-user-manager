var definition = {
	'fileId': {
		'type': 'String',
		'required': true,
	},
	'_metadata': {
		'type': {
			'version': {
				'release': {
					'type': 'Number'
				}
			}
		},
		'createdAt': {
			'type': 'Date'
		},
		'lastUpdated': {
			'type': 'Date'
		},
		'deleted': {
			'type': 'Boolean'
		}
	},
	'fileName': {
		'type': 'String'
	},
	'sNo': {
		'type': 'Number'
	},
	'data': {
		'type': 'Object'
	},
	'duplicate': {
		'type': 'Boolean',
		'default': false
	},
	'existsInApp': {
		'type': 'Boolean',
		'default': false
	},
	'existsInPlatform': {
		'type': 'Boolean',
		'default': false
	},
	'message': {
		'type': 'String'
	},
	'status': {
		'type': 'String',
		'enum': ['Pending', 'Validated', 'Created', 'Error', 'Ignored', 'Success']
	}
};
module.exports.definition = definition;
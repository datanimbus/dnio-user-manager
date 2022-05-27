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
		'type': 'Boolean'
	},
	'existsInApp': {
		'type': 'Boolean'
	},
	'existsInPlatform': {
		'type': 'Boolean'
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
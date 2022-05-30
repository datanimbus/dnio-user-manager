var definition = {
	'_id': {
		'type': 'String',
		'required': true,
	},
	'app': {
		'type': 'String',
		'required': true,
	},
	'user': {
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
	'errorMessage': {
		'type': 'String'
	},
	'totalCount': {
		'type': 'Number'
	},
	'successCount': {
		'type': 'Number'
	},
	'errorCount': {
		'type': 'Number'
	},
	'ignoredCount': {
		'type': 'Number'
	},
	'status': {
		'type': 'String',
		'enum': ['Pending', 'Uploaded', 'Validating', 'Completed', 'Error', 'Ignored']
	}
};
module.exports.definition = definition;
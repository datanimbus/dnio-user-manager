var definition = {
	'_id': {
		'type': 'String',
	},
	'app': {
		'type': 'String'
	},
	'forDataType': {
		'type': 'String'
	},
	'name': {
		'type': 'String'
	},
	'returnType': {
		'type': 'String'
	},
	'params': {
		'type': [{
			'name': {
				'type': 'String'
			},
			'type': {
				'type': 'String'
			}
		}]
	},
	'code': {
		'type': 'String'
	},
	'_metadata': {
		'type': {
			'version': {
				'release': { 'type': 'Number' }
			}
		}
	}
};
module.exports.definition = definition;
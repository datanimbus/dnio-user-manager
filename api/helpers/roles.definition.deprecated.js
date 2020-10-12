var definition = {
	'_id': {
		'type': 'String'
	},
	'name': {
		'type': 'String'
	},
	'app': {
		'type': 'String'
	},
	'description': {
		'type': 'String'
	},
	'permissions': {
		'type': [{
			'id': {
				'type': 'String'
			},
			'name': {
				'type': 'String'
			}
		}]
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
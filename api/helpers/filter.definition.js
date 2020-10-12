var definition = {
	'_id': {
		'type': 'String'
	},
	'serviceId': {
		'type': 'String'
	},
	'app': {
		'type': 'String'
	},
	'private': {
		'type': 'Boolean'
	},
	'name': {
		'type': 'String'
	},
	'createdBy': {
		'type': 'String',
		'required': true
	},
	'value': {
		'type': 'String'
	},
	'type': {
		'type': 'String'
	},
	'description': {
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
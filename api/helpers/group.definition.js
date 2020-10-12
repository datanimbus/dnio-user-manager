var definition = {
	'_id': {
		'type': 'String'
	},
	'name': {
		'type': 'String'
	},
	'description': {
		'type': 'String'
	},
	'app': {
		'type': 'String',
		'required': true
	},
	'isActive': {
		'type': 'Boolean',
		'default': true
	},
	'_metadata': {
		'type': {
			'version': {
				'release': { 'type': 'Number' }
			}
		}
	},
	'users': {
		'type': ['String']
	},
	'roles': {
		'type': [{
			'id': {
				'type': 'String'
			},
			'app':{
				'type': 'String'
			},
			'entity':{
				'type': 'String'
			},
			'type':{
				'type': 'String'
			}
		}]
	}
};
module.exports.definition = definition;
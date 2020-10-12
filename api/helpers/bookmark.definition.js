var defintion = {
	'_id': {
		'type': 'String'
	},
	'name': {
		'type': 'String',
		'required': true
	},
	'url': {
		'type': 'String',
		'required': true
	},
	'app': {
		'type': 'String',
		'required': true
	},
	'createdBy':{
		'type': 'String'
	},
	'parameters': {
		'username': {
			'type': 'Boolean'
		},
		'appname': {
			'type': 'Boolean'
		},
		'token': {
			'type': 'Boolean'
		},
		'custom': {
			'type': 'Object'
		}
	},
	'options': {
		'type': 'String',
		'enum': ['FRAME', 'NEW_TAB'],
	},
	'_metadata': {
		'type': {
			'version': {
				'release': {
					'type': 'Number'
				}
			}
		}
	}
};
module.exports.definition = defintion;
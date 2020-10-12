var definition = {
	'_id': {
		'type': 'String'
	},
	'username': {
		'type': 'String',
		'unique': true
	},
	'salt': {
		'type': 'String',
		'default': null
	},
	'password': {
		'type': 'String'
	},
	'isActive': {
		'type': 'Boolean',
		'default': true
	},
	'isSuperAdmin': {
		'type': 'Boolean',
		'default': false
	},
	'enableSessionRefresh': {
		'type': 'Boolean',
		'default': false
	},
	'roles': {
		'type': [{
			'id': {
				'type': 'String'
			},
			'name': {
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
	},
	'group': {
		'type': [{
			'groupId': {
				'type': 'String'
			},
			'groupName': {
				'type': 'String'
			}
		}]
	},
	'basicDetails': {
		'name': 'String',
		'alternateEmail': 'String',
		'phone': 'String',
	},
	'description': 'String',
	'sessionTime': 'Number',
	'accessControl': {
		'type': {
			'accessLevel': {
				'type': 'String',
				'enum': ['All', 'Selected', 'None'],
				'default': 'None'
			},
			'apps': {
				'type': [{
					'_id': {
						'type': 'String'
					},
					'type': {
						'type': 'String'
					}
				}]
			}
		}
	},
	'errorMessage': {
		'type': 'String'
	},
	'auth': {
		'type': {
			'isLdap': {
				'type': 'Boolean',
				'default': false
			},
			'dn': {
				'type': 'String'
			},
			'authType': {
				'type': 'String'
			},
			'adAttribute': {
				'type': 'String'
			}
		}
	},
	'bot': {
		'type': 'Boolean',
		'default': false
	},
	'botKeys': {
		'type': [{
			'_id': {
				'type': 'String'
			},
			'label': {
				'type': 'String'
			},
			'expires': {
				'type': 'Number'
			},
			'keyValue': {
				'type': 'String'
			},
			'isActive': {
				'type': 'Boolean',
				'default': false
			},
			'createdAt': {
				'type': 'Date'
			}
		}]
	},
	'attributes': {
		'type': 'Object'
	},
	'lastLogin': {
		'type': 'Date'
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
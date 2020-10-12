var definition = {
	'_id': {
		'type': 'String',
		'default': null
	},
	'app': {
		'type': 'String'
	},
	'entity': {
		'type': 'String'
	},
	'entityName': {
		'type': 'String'
	},
	'default': {
		'type': 'String',
		'enum': ['W', 'R', 'N']
	},
	'type': {
		'type': 'String'
	},
	'roles': {
		'type': [{
			'id': 'String',
			'name': 'String',
			'skipReviewRole': 'Boolean',
			'manageRole': 'Boolean',
			'viewRole': 'Boolean',
			'operations': {
				'type': [{
					'method': {
						'type': 'String',
						'enum': ['GET', 'POST', 'PUT', 'DELETE', 'REVIEW', 'SKIP_REVIEW']
					},
					'workflowRoles': {
						'type': [{
							'type': 'String'
						}]
					}
				}]
			},
			'rule': {
				'type': 'Object'
			},
			'description': {
				'type': 'String'
			}
		}]
	},
	'fields': {
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
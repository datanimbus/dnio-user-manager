const mongoose = require('mongoose');
const envConfig = require('../../config/config');
const Schema = mongoose.Schema;
var definition = {
	'_id': {
		'type': 'String',
		'required': true,
		'uniqueCaseInsensitive': true
	},
	'_metadata': {
		'type': {
			'version': {
				'release': {
					'type': 'Number'
				}
			}
		}
	},
	'appCenterStyle': {
		'theme': {
			'type': 'String',
			'enum': ['Dark', 'Light'],
			'default': 'Light'
		},
		'bannerColor': {
			'type': 'Boolean',
			'default': true
		},
		'primaryColor': {
			'type': 'String',
			'default': '#03A9F4'
		},
		'textColor': {
			'type': 'String',
			'default': '#FFFFFF'
		}
	},
	'logo': {
		'type': {
			'full': {
				'type': 'String'
			},
			'thumbnail': {
				'type': 'String'
			}
		}
	},
	'attributes': {
		'type': 'Object'
	},
	'headers': {
		'type': 'Object'
	},
	'serviceVersionValidity': {
		'type': {
			'validityValue': Schema.Types.Mixed,
			'validityType': {
				'type': 'String',
				'enum': ['count', 'time']
			}
		}
	},
	'agentIPWhitelisting': {
		'list': [{
			'type': 'String'
		}],
		'enabled': {
			'type': 'Boolean',
			'default': false
		}
	},
	'defaultTimezone': {
		'type': 'String',
		'default': envConfig.dataStackDefaultTimezone
	},
	'disableInsights': {
		'type': 'Boolean',
		'default': envConfig.disableInsightsApp
	},
	'owner': {
		'type': 'String'
	},
	'plan': {
		'type': 'String',
		'enum': ['free', 'paid']
	},
	'gracePeriod':{
		'type': 'Number'
	}
};
module.exports.definition = definition;
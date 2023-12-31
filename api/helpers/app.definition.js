const mongoose = require('mongoose');
const envConfig = require('../../config/config');
const Schema = mongoose.Schema;
var definition = {
	'_id': {
		'type': 'String',
		'required': true,
		'uniqueCaseInsensitive': true
	},
	'type': {
		'type': 'String',
		'enum': ['Management', 'Distribution']
	},
	'description': {
		'type': 'String'
	},
	'_metadata': {
		'type': {
			'version': {
				'type': {
					'release': {
						'type': Schema.Types.Mixed
					}
				}
			}
		}
	},
	'encryptionKey': {
		'type': 'String'
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
			'default': '#44a8f1'
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
	'maskingPaths': {
		'type': 'Object'
	},
	'interactionStore': {
		'type': {
			'retainPolicy': {
				'retainType': {
					'type': 'String',
					'enum': ['count', 'days'],
					'default': 'days'
				},
				'retainValue': {
					'type': 'Number',
					'default': 10,
					'min': -1
				}
			},
			'storeType': {
				'type': 'String',
				'enum': ['db', 'azureblob', 'awss3'],
				'default': 'db'
			},
			'configuration': {
				'type': 'Object'
			}
		}
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
	'connectors': {
		'type': 'Object'
	},
	'npmLibraries': {
		'type': 'String'
	},
	'faasBaseImage': {
		'type': 'String'
	},
	'b2bBaseImage': {
		'type': 'String'
	}
};
module.exports.definition = definition;
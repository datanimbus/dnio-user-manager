var definition = {
	'_id': {
		'type': 'String'
	},
	'auth': {
		'type': {
			'mode': {
				'type': 'String'
			},
			'class': {
				'type': 'String'
			},
			'connectionDetails': {
				'type': {
					'url': {
						'type': 'String'
					},
					'bindDN': {
						'type': 'String'
					},
					'mapping': {
						'type': 'String'
					},
					'baseDN': {
						'type': 'String'
					},
					'baseFilter': {
						'type': 'String'
					},
					'clientId': {
						'type': 'String'
					},
					'clientSecret': {
						'type': 'String'
					},
					'tenant': {
						'type': 'String'
					},
					'accessToken': {
						'type': 'String'
					},
					'redirectUri': {
						'login': {
							'type': 'String'
						},
						'userFetch': {
							'type': 'String'
						}
					},
					'adUsernameAttribute': {
						'type': 'String'
					}
				}
			},
			'enabled': {
				'type': 'Boolean',
				'default': false
			}
		}
	},
	'configType': {
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
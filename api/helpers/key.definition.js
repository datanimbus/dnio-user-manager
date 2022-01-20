var definition = {
	'_id': {
		'type': 'String'
	},
	'data': {
		'type': 'String'
	},
	'name': {
		'type': 'String'
	},
	'key': {
		'type': 'String'
	},
	'certificate': {
		'type': 'String'
	},
	'app': {
		'type': 'String',
		'unique' : true,
	},
	'expiry': {
		'type': 'String'
	},
	'info': {
		'type': 'Object',
		'definition': {
			'serialNumber': {
				'type': 'String'
			},
			'signatureOID': {
				'type': 'String'
			},
			'signatureAlgorithm': {
				'type': 'String'
			},
			'infoSignatureOID': {
				'type': 'String'
			},
			'signature': {
				'type': 'String'
			},
			'validFrom': {
				'type': 'String'
			},
			'validTo': {
				'type': 'String'
			},
			'subjectKeyIdentifier': {
				'type': 'String'
			},
			'authorityKeyIdentifier': {
				'type': 'String'
			},
			'ocspServer': {
				'type': 'String'
			},
			'issuingCertificateURL': {
				'type': 'String'
			},
			'isCA': {
				'type': 'String'
			},
			'maxPathLen': {
				'type': 'String'
			},
			'basicConstraintsValid': {
				'type': 'String'
			},
			'keyUsage': {
				'type': 'String'
			},
			'extensions': ['String'],
			'dnsNames': ['String'],
			'emailAddresses': ['String'],
			'ipAddresses': ['String'],
			'uris': ['String'],
			'issuer': {
				'type': 'Object',
				'definition': {
					'CN': {
						'type': 'String'
					},
					'uniqueId': {
						'type': 'String'
					},
					'attributes': [{
						'oid': {
							'type': 'String'
						},
						'value': {
							'type': 'String'
						},
						'valueTag': {
							'type': 'String'
						},
						'name': {
							'type': 'String'
						},
						'shortName': {
							'type': 'String'
						}
					}]
				}
			},
			'subject': {
				'type': 'Object',
				'definition': {
					'CN': {
						'type': 'String'
					},
					'uniqueId': {
						'type': 'String'
					},
					'attributes': [{
						'oid': {
							'type': 'String'
						},
						'value': {
							'type': 'String'
						},
						'valueTag': {
							'type': 'String'
						},
						'name': {
							'type': 'String'
						},
						'shortName': {
							'type': 'String'
						}
					}]
				}
			},
			'publicKey': {
				'oid': {
					'type': 'String'
				},
				'algo': {
					'type': 'String'
				},
				'publicKey': {
					'type': 'String'
				},
				'publicKeyRaw': {
					'type': 'String'
				}
			}
		}
	}
};
module.exports.definition = definition;
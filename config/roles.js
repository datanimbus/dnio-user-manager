module.exports = [
	{
		'entity': 'SM',
		'entityName': 'Service Manager',
		'type': 'author',
		'roles': [
			{ id: 'PMDSD', name: 'Manage Data Services Design', operations: [{ method: 'PUT' }, { method: 'POST' }] },
			{ id: 'PMDSI', name: 'Manage Data Services Integration', operations: [{ method: 'PUT' }, { method: 'POST' }] },
			{ id: 'PMDSE', name: 'Manage Data Services Experience', operations: [{ method: 'PUT' }, { method: 'POST' }] },
			{ id: 'PMDSR', name: 'Manage Data Services Roles', operations: [{ method: 'PUT' }, { method: 'POST' }] },
			{ id: 'PMDSS', name: 'Manage Data Services Settings', operations: [{ method: 'PUT' }, { method: 'POST' }] },
			{ id: 'PVDSD', name: 'View Data Services Design', operations: [{ method: 'GET' }] },
			{ id: 'PVDSI', name: 'View Data Services Integration', operations: [{ method: 'GET' }] },
			{ id: 'PVDSE', name: 'View Data Services Experience', operations: [{ method: 'GET' }] },
			{ id: 'PVDSR', name: 'View Data Services Roles', operations: [{ method: 'GET' }] },
			{ id: 'PVDSS', name: 'View Data Services Settings', operations: [{ method: 'GET' }] },
			{ id: 'PVDSA', name: 'View Data Services Audit', operations: [{ method: 'GET' }] },
			{ id: 'PNDSI', name: 'No Access Data Services Integration', operations: [{ method: 'PUT' }, { method: 'GET' }] },
			{ id: 'PNDSS', name: 'No Access Data Services Audit', operations: [{ method: 'PUT' }, { method: 'GET' }] },
			/*********** */
			{ id: 'PNDSB', name: 'No Access Data Services Basic Details', operations: [{ method: 'PUT' }, { method: 'POST' }, { method: 'DELETE' }, { method: 'GET' }] },
			{ id: 'PVDSB', name: 'View Data Services Basic Details', operations: [{ method: 'GET' }] },
			{ id: 'PMDSBC', name: 'Create Data Services', operations: [{ method: 'POST' }] },
			{ id: 'PMDSBU', name: 'Update Data Services', operations: [{ method: 'PUT' }] },
			{ id: 'PMDSBD', name: 'Remove Data Services', operations: [{ method: 'DELETE' }] },
			{ id: 'PMDSPD', name: 'Manage Deploy Data Services', operations: [{ method: 'PUT' }, { method: 'POST' }] },
			{ id: 'PMDSPS', name: 'Manage Start/Stop Data Services ', operations: [{ method: 'PUT' }, { method: 'POST' }] },
			{ id: 'PNDSPD', name: 'No Access Deploy Data Services', operations: [{ method: 'PUT' }] },
			{ id: 'PNDSPS', name: 'No Access Start/Stop Data Services', operations: [{ method: 'PUT' }] }
		],
		'default': 'R',
		'fields': {
			'_id': {
				'_t': 'String',
				'_p': {
					'PMDSD': 'W',
					'PMDSI': 'R',
					'PMDSE': 'R',
					'PMDSR': 'R',
					'PMDSS': 'R',
					'PVDSD': 'R',
					'PVDSI': 'R',
					'PVDSE': 'R',
					'PVDSR': 'R',
					'PVDSS': 'R',
					'PVDSA': 'R',
					'PNDSI': 'R',
					'PNDSS': 'R',
					////////////
					'PNDSB': 'R',
					'PVDSB': 'R',
					'PMDSBC': 'W',
					'PMDSBU': 'W',
					'PMDSBD': 'R',
					'PMDSPD': 'R',
					'PMDSPS': 'R',
					'PNDSPD': 'R',
					'PNDSPS': 'R'
				}
			},
			'name': {
				'_t': 'String',
				'_p': {
					'PMDSD': 'R',
					'PMDSI': 'R',
					'PMDSE': 'R',
					'PMDSR': 'R',
					'PMDSS': 'R',
					'PVDSD': 'R',
					'PVDSI': 'R',
					'PVDSE': 'R',
					'PVDSR': 'R',
					'PVDSS': 'R',
					'PVDSA': 'R',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'R',
					'PMDSBC': 'W',
					'PMDSBU': 'W',
					'PMDSBD': 'R',
					'PMDSPD': 'R',
					'PMDSPS': 'R',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'description': {
				'_t': 'String',
				'_p': {
					'PMDSD': 'R',
					'PMDSI': 'R',
					'PMDSE': 'R',
					'PMDSR': 'R',
					'PMDSS': 'R',
					'PVDSD': 'R',
					'PVDSI': 'R',
					'PVDSE': 'R',
					'PVDSR': 'R',
					'PVDSS': 'R',
					'PVDSA': 'R',
					'PNDSI': 'N',
					'PNDSS': 'R',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'R',
					'PMDSBC': 'W',
					'PMDSBU': 'W',
					'PMDSBD': 'R',
					'PMDSPD': 'R',
					'PMDSPS': 'R',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'disableInsights': {
				'_t': 'String',
				'_p': {
					'PMDSD': 'N',
					'PMDSI': 'N',
					'PMDSE': 'N',
					'PMDSR': 'N',
					'PMDSS': 'W',
					'PVDSD': 'N',
					'PVDSI': 'N',
					'PVDSE': 'N',
					'PVDSR': 'N',
					'PVDSS': 'R',
					'PVDSA': 'N',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'N',
					'PMDSBC': 'N',
					'PMDSBU': 'N',
					'PMDSBD': 'N',
					'PMDSPD': 'N',
					'PMDSPS': 'N',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'collectionName': {
				'_t': 'String',
				'_p': {
					'PMDSD': 'N',
					'PMDSI': 'N',
					'PMDSE': 'N',
					'PMDSR': 'N',
					'PMDSS': 'N',
					'PVDSD': 'N',
					'PVDSI': 'N',
					'PVDSE': 'N',
					'PVDSR': 'N',
					'PVDSS': 'N',
					'PVDSA': 'N',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'N',
					'PMDSBC': 'N',
					'PMDSBU': 'N',
					'PMDSBD': 'N',
					'PMDSPD': 'N',
					'PMDSPS': 'N',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'permanentDeleteData': {
				'_t': 'String',
				'_p': {
					'PMDSD': 'N',
					'PMDSI': 'N',
					'PMDSE': 'N',
					'PMDSR': 'N',
					'PMDSS': 'W',
					'PVDSD': 'N',
					'PVDSI': 'N',
					'PVDSE': 'N',
					'PVDSR': 'N',
					'PVDSS': 'R',
					'PVDSA': 'N',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'N',
					'PMDSBC': 'N',
					'PMDSBU': 'N',
					'PMDSBD': 'N',
					'PMDSPD': 'N',
					'PMDSPS': 'N',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'app': {
				'_t': 'String',
				'_p': {
					'PMDSD': 'W',
					'PMDSI': 'W',
					'PMDSE': 'W',
					'PMDSR': 'W',
					'PMDSS': 'W',
					'PVDSD': 'R',
					'PVDSI': 'R',
					'PVDSE': 'R',
					'PVDSR': 'R',
					'PVDSS': 'R',
					'PVDSA': 'R',
					'PNDSI': 'R',
					'PNDSS': 'R',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'R',
					'PMDSBC': 'W',
					'PMDSBU': 'W',
					'PMDSBD': 'R',
					'PMDSPD': 'R',
					'PMDSPS': 'R',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'api': {
				'_t': 'String',
				'_p': {
					'PMDSD': 'N',
					'PMDSI': 'N',
					'PMDSE': 'N',
					'PMDSR': 'N',
					'PMDSS': 'W',
					'PVDSD': 'N',
					'PVDSI': 'N',
					'PVDSE': 'N',
					'PVDSR': 'N',
					'PVDSS': 'R',
					'PVDSA': 'N',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'N',
					'PMDSBC': 'N',
					'PMDSBU': 'N',
					'PMDSBD': 'N',
					'PMDSPD': 'N',
					'PMDSPS': 'N',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'port': {
				'_t': 'Number',
				'_p': {
					'PMDSD': 'N',
					'PMDSI': 'N',
					'PMDSE': 'N',
					'PMDSR': 'N',
					'PMDSS': 'N',
					'PVDSD': 'N',
					'PVDSI': 'N',
					'PVDSE': 'N',
					'PVDSR': 'N',
					'PVDSS': 'N',
					'PVDSA': 'N',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'N',
					'PMDSBC': 'N',
					'PMDSBU': 'N',
					'PMDSBD': 'N',
					'PMDSPD': 'N',
					'PMDSPS': 'N',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'wizard': {
				'_t': 'Array',
				'_p': {
					'PMDSD': 'N',
					'PMDSI': 'N',
					'PMDSE': 'W',
					'PMDSR': 'N',
					'PMDSS': 'N',
					'PVDSD': 'N',
					'PVDSI': 'N',
					'PVDSE': 'R',
					'PVDSR': 'N',
					'PVDSS': 'N',
					'PVDSA': 'N',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'N',
					'PMDSBC': 'N',
					'PMDSBU': 'N',
					'PMDSBD': 'N',
					'PMDSPD': 'N',
					'PMDSPS': 'N',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'version': {
				'_t': 'Number',
				'_p': {
					'PMDSD': 'R',
					'PMDSI': 'R',
					'PMDSE': 'R',
					'PMDSR': 'R',
					'PMDSS': 'R',
					'PVDSD': 'R',
					'PVDSI': 'R',
					'PVDSE': 'R',
					'PVDSR': 'R',
					'PVDSS': 'R',
					'PVDSA': 'R',
					'PNDSI': 'N',
					'PNDSS': 'R',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'R',
					'PMDSBC': 'R',
					'PMDSBU': 'R',
					'PMDSBD': 'R',
					'PMDSPD': 'R',
					'PMDSPS': 'R',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'instances': {
				'_t': 'Number',
				'_p': {
					'PMDSD': 'N',
					'PMDSI': 'N',
					'PMDSE': 'N',
					'PMDSR': 'N',
					'PMDSS': 'N',
					'PVDSD': 'N',
					'PVDSI': 'N',
					'PVDSE': 'N',
					'PVDSR': 'N',
					'PVDSS': 'N',
					'PVDSA': 'N',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'N',
					'PMDSBC': 'N',
					'PMDSBU': 'N',
					'PMDSBD': 'N',
					'PMDSPD': 'N',
					'PMDSPS': 'N',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'versionValidity': {
				'_t': 'Object',
				'_p': {
					'PMDSD': 'N',
					'PMDSI': 'N',
					'PMDSE': 'N',
					'PMDSR': 'N',
					'PMDSS': 'W',
					'PVDSD': 'N',
					'PVDSI': 'N',
					'PVDSE': 'N',
					'PVDSR': 'N',
					'PVDSS': 'R',
					'PVDSA': 'N',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'N',
					'PMDSBC': 'N',
					'PMDSBU': 'N',
					'PMDSBD': 'N',
					'PMDSPD': 'N',
					'PMDSPS': 'N',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'stateModel': {
				'_t': 'Object',
				'_p': {
					'PMDSD': 'R',
					'PMDSI': 'N',
					'PMDSE': 'W',
					'PMDSR': 'N',
					'PMDSS': 'N',
					'PVDSD': 'R',
					'PVDSI': 'N',
					'PVDSE': 'R',
					'PVDSR': 'N',
					'PVDSS': 'N',
					'PVDSA': 'N',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'N',
					'PMDSBC': 'N',
					'PMDSBU': 'N',
					'PMDSBD': 'N',
					'PMDSPD': 'N',
					'PMDSPS': 'N',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'definition': {
				'_t': 'Array',
				'_p': {
					'PMDSD': 'W',
					'PMDSI': 'N',
					'PMDSE': 'R',
					'PMDSR': 'R',
					'PMDSS': 'N',
					'PVDSD': 'R',
					'PVDSI': 'N',
					'PVDSE': 'R',
					'PVDSR': 'R',
					'PVDSS': 'N',
					'PVDSA': 'N',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'N',
					'PMDSBC': 'N',
					'PMDSBU': 'N',
					'PMDSBD': 'N',
					'PMDSPD': 'N',
					'PMDSPS': 'N',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'status': {
				'_t': 'String',
				'_p': {
					'PMDSD': 'R',
					'PMDSI': 'R',
					'PMDSE': 'R',
					'PMDSR': 'R',
					'PMDSS': 'R',
					'PVDSD': 'R',
					'PVDSI': 'R',
					'PVDSE': 'R',
					'PVDSR': 'R',
					'PVDSS': 'R',
					'PVDSA': 'R',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'R',
					'PMDSBC': 'R',
					'PMDSBU': 'R',
					'PMDSBD': 'R',
					'PMDSPD': 'W',
					'PMDSPS': 'W',
					'PNDSPD': 'R',
					'PNDSPS': 'R'
				}
			},
			'internalVersion': {
				'_t': 'String',
				'_p': {
					'PMDSD': 'N',
					'PMDSI': 'N',
					'PMDSE': 'N',
					'PMDSR': 'N',
					'PMDSS': 'N',
					'PVDSD': 'N',
					'PVDSI': 'N',
					'PVDSE': 'N',
					'PVDSR': 'N',
					'PVDSS': 'N',
					'PVDSA': 'N',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'N',
					'PMDSBC': 'N',
					'PMDSBU': 'N',
					'PMDSBD': 'N',
					'PMDSPD': 'N',
					'PMDSPS': 'N',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'comment': {
				'_t': 'String',
				'_p': {
					'PMDSD': 'N',
					'PMDSI': 'N',
					'PMDSE': 'N',
					'PMDSR': 'N',
					'PMDSS': 'N',
					'PVDSD': 'N',
					'PVDSI': 'N',
					'PVDSE': 'N',
					'PVDSR': 'N',
					'PVDSS': 'N',
					'PVDSA': 'N',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'N',
					'PMDSBC': 'N',
					'PMDSBU': 'N',
					'PMDSBD': 'N',
					'PMDSPD': 'N',
					'PMDSPS': 'N',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'relatedSchemas': {
				'_t': 'Array',
				'_p': {
					'PMDSD': 'R',
					'PMDSI': 'N',
					'PMDSE': 'N',
					'PMDSR': 'N',
					'PMDSS': 'N',
					'PVDSD': 'R',
					'PVDSI': 'N',
					'PVDSE': 'N',
					'PVDSR': 'N',
					'PVDSS': 'N',
					'PVDSA': 'N',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'N',
					'PMDSBC': 'N',
					'PMDSBU': 'N',
					'PMDSBD': 'N',
					'PMDSPD': 'N',
					'PMDSPS': 'N',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}

			},
			'webHooks': {
				'_t': 'Array',
				'_p': {
					'PMDSD': 'N',
					'PMDSI': 'W',
					'PMDSE': 'N',
					'PMDSR': 'N',
					'PMDSS': 'N',
					'PVDSD': 'N',
					'PVDSI': 'R',
					'PVDSE': 'N',
					'PVDSR': 'N',
					'PVDSS': 'N',
					'PVDSA': 'N',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'N',
					'PMDSBC': 'N',
					'PMDSBU': 'N',
					'PMDSBD': 'N',
					'PMDSPD': 'N',
					'PMDSPS': 'N',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'preHooks': {
				'_t': 'Array',
				'_p': {
					'PMDSD': 'N',
					'PMDSI': 'W',
					'PMDSE': 'N',
					'PMDSR': 'N',
					'PMDSS': 'N',
					'PVDSD': 'N',
					'PVDSI': 'R',
					'PVDSE': 'N',
					'PVDSR': 'N',
					'PVDSS': 'N',
					'PVDSA': 'N',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'N',
					'PMDSBC': 'N',
					'PMDSBU': 'N',
					'PMDSBD': 'N',
					'PMDSPD': 'N',
					'PMDSPS': 'N',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'workflowHooks': {
				'postHooks': {
					'submit': {
						'_t': 'Array',
						'_p': {
							'PMDSD': 'N',
							'PMDSI': 'W',
							'PMDSE': 'N',
							'PMDSR': 'N',
							'PMDSS': 'N',
							'PVDSD': 'N',
							'PVDSI': 'R',
							'PVDSE': 'N',
							'PVDSR': 'N',
							'PVDSS': 'N',
							'PVDSA': 'N',
							'PNDSI': 'N',
							'PNDSS': 'N',
							////////////
							'PNDSB': 'N',
							'PVDSB': 'N',
							'PMDSBC': 'N',
							'PMDSBU': 'N',
							'PMDSBD': 'N',
							'PMDSPD': 'N',
							'PMDSPS': 'N',
							'PNDSPD': 'N',
							'PNDSPS': 'N'
						}
					},
					'approve': {
						'_t': 'Array',
						'_p': {
							'PMDSD': 'N',
							'PMDSI': 'W',
							'PMDSE': 'N',
							'PMDSR': 'N',
							'PMDSS': 'N',
							'PVDSD': 'N',
							'PVDSI': 'R',
							'PVDSE': 'N',
							'PVDSR': 'N',
							'PVDSS': 'N',
							'PVDSA': 'N',
							'PNDSI': 'N',
							'PNDSS': 'N',
							////////////
							'PNDSB': 'N',
							'PVDSB': 'N',
							'PMDSBC': 'N',
							'PMDSBU': 'N',
							'PMDSBD': 'N',
							'PMDSPD': 'N',
							'PMDSPS': 'N',
							'PNDSPD': 'N',
							'PNDSPS': 'N'
						}
					},
					'reject': {
						'_t': 'Array',
						'_p': {
							'PMDSD': 'N',
							'PMDSI': 'W',
							'PMDSE': 'N',
							'PMDSR': 'N',
							'PMDSS': 'N',
							'PVDSD': 'N',
							'PVDSI': 'R',
							'PVDSE': 'N',
							'PVDSR': 'N',
							'PVDSS': 'N',
							'PVDSA': 'N',
							'PNDSI': 'N',
							'PNDSS': 'N',
							////////////
							'PNDSB': 'N',
							'PVDSB': 'N',
							'PMDSBC': 'N',
							'PMDSBU': 'N',
							'PMDSBD': 'N',
							'PMDSPD': 'N',
							'PMDSPS': 'N',
							'PNDSPD': 'N',
							'PNDSPS': 'N'
						}
					},
					'discard': {
						'_t': 'Array',
						'_p': {
							'PMDSD': 'N',
							'PMDSI': 'W',
							'PMDSE': 'N',
							'PMDSR': 'N',
							'PMDSS': 'N',
							'PVDSD': 'N',
							'PVDSI': 'R',
							'PVDSE': 'N',
							'PVDSR': 'N',
							'PVDSS': 'N',
							'PVDSA': 'N',
							'PNDSI': 'N',
							'PNDSS': 'N',
							////////////
							'PNDSB': 'N',
							'PVDSB': 'N',
							'PMDSBC': 'N',
							'PMDSBU': 'N',
							'PMDSBD': 'N',
							'PMDSPD': 'N',
							'PMDSPS': 'N',
							'PNDSPD': 'N',
							'PNDSPS': 'N'
						}
					},
					'rework': {
						'_t': 'Array',
						'_p': {
							'PMDSD': 'N',
							'PMDSI': 'W',
							'PMDSE': 'N',
							'PMDSR': 'N',
							'PMDSS': 'N',
							'PVDSD': 'N',
							'PVDSI': 'R',
							'PVDSE': 'N',
							'PVDSR': 'N',
							'PVDSS': 'N',
							'PVDSA': 'N',
							'PNDSI': 'N',
							'PNDSS': 'N',
							////////////
							'PNDSB': 'N',
							'PVDSB': 'N',
							'PMDSBC': 'N',
							'PMDSBU': 'N',
							'PMDSBD': 'N',
							'PMDSPD': 'N',
							'PMDSPS': 'N',
							'PNDSPD': 'N',
							'PNDSPS': 'N'
						}
					}
				}
			},
			'tags': {
				'_t': 'Array',
				'_p': {
					'PMDSD': 'N',
					'PMDSI': 'N',
					'PMDSE': 'N',
					'PMDSR': 'N',
					'PMDSS': 'N',
					'PVDSD': 'N',
					'PVDSI': 'N',
					'PVDSE': 'N',
					'PVDSR': 'N',
					'PVDSS': 'N',
					'PVDSA': 'N',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'N',
					'PMDSBC': 'N',
					'PMDSBU': 'N',
					'PMDSBD': 'N',
					'PMDSPD': 'N',
					'PMDSPS': 'N',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'headers': {
				'_t': 'Object',
				'_p': {
					'PMDSD': 'N',
					'PMDSI': 'N',
					'PMDSE': 'N',
					'PMDSR': 'N',
					'PMDSS': 'W',
					'PVDSD': 'N',
					'PVDSI': 'N',
					'PVDSE': 'N',
					'PVDSR': 'N',
					'PVDSS': 'R',
					'PVDSA': 'N',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'N',
					'PMDSBC': 'N',
					'PMDSBU': 'N',
					'PMDSBD': 'N',
					'PMDSPD': 'N',
					'PMDSPS': 'N',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'attributeCount': {
				'_t': 'Number',
				'_p': {
					'PMDSD': 'R',
					'PMDSI': 'R',
					'PMDSE': 'R',
					'PMDSR': 'R',
					'PMDSS': 'R',
					'PVDSD': 'R',
					'PVDSI': 'R',
					'PVDSE': 'R',
					'PVDSR': 'R',
					'PVDSS': 'R',
					'PVDSA': 'R',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'R',
					'PMDSBC': 'R',
					'PMDSBU': 'R',
					'PMDSBD': 'R',
					'PMDSPD': 'R',
					'PMDSPS': 'R',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'draftVersion': {
				'_t': 'String',
				'_p': {
					'PMDSD': 'W',
					'PMDSI': 'R',
					'PMDSE': 'R',
					'PMDSR': 'R',
					'PMDSS': 'R',
					'PVDSD': 'R',
					'PVDSI': 'R',
					'PVDSE': 'R',
					'PVDSR': 'R',
					'PVDSS': 'R',
					'PVDSA': 'R',
					'PNDSI': 'R',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'R',
					'PMDSBC': 'R',
					'PMDSBU': 'R',
					'PMDSBD': 'R',
					'PMDSPD': 'R',
					'PMDSPS': 'R',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'_metadata': {
				'lastUpdated': {
					'_t': 'Date',
					'_p': {
						'PMDSD': 'R',
						'PMDSI': 'R',
						'PMDSE': 'R',
						'PMDSR': 'R',
						'PMDSS': 'R',
						'PVDSD': 'R',
						'PVDSI': 'R',
						'PVDSE': 'R',
						'PVDSR': 'R',
						'PVDSS': 'R',
						'PVDSA': 'R',
						'PNDSI': 'N',
						'PNDSS': 'N',
						////////////
						'PNDSB': 'N',
						'PVDSB': 'R',
						'PMDSBC': 'R',
						'PMDSBU': 'R',
						'PMDSBD': 'R',
						'PMDSPD': 'R',
						'PMDSPS': 'R',
						'PNDSPD': 'N',
						'PNDSPS': 'N'
					}
				},
				'createdAt': {
					'_t': 'Date',
					'_p': {
						'PMDSD': 'R',
						'PMDSI': 'R',
						'PMDSE': 'R',
						'PMDSR': 'R',
						'PMDSS': 'R',
						'PVDSD': 'R',
						'PVDSI': 'R',
						'PVDSE': 'R',
						'PVDSR': 'R',
						'PVDSS': 'R',
						'PVDSA': 'R',
						'PNDSI': 'N',
						'PNDSS': 'N',
						////////////
						'PNDSB': 'N',
						'PVDSB': 'R',
						'PMDSBC': 'R',
						'PMDSBU': 'R',
						'PMDSBD': 'R',
						'PMDSPD': 'R',
						'PMDSPS': 'R',
						'PNDSPD': 'N',
						'PNDSPS': 'N'
					}
				},
				'lastUpdatedBy': {
					'_t': 'Date',
					'_p': {
						'PMDSD': 'R',
						'PMDSI': 'R',
						'PMDSE': 'R',
						'PMDSR': 'R',
						'PMDSS': 'R',
						'PVDSD': 'R',
						'PVDSI': 'R',
						'PVDSE': 'R',
						'PVDSR': 'R',
						'PVDSS': 'R',
						'PVDSA': 'R',
						'PNDSI': 'N',
						'PNDSS': 'N',
						////////////
						'PNDSB': 'N',
						'PVDSB': 'R',
						'PMDSBC': 'R',
						'PMDSBU': 'R',
						'PMDSBD': 'R',
						'PMDSPD': 'R',
						'PMDSPS': 'R',
						'PNDSPD': 'N',
						'PNDSPS': 'N'
					}
				},
				'version': {
					'release': {
						'_t': 'Number',
						'_p': {
							'PMDSD': 'R',
							'PMDSI': 'R',
							'PMDSE': 'R',
							'PMDSR': 'R',
							'PMDSS': 'R',
							'PVDSD': 'R',
							'PVDSI': 'R',
							'PVDSE': 'R',
							'PVDSR': 'R',
							'PVDSS': 'R',
							'PVDSA': 'R',
							'PNDSI': 'N',
							'PNDSS': 'N',
							////////////
							'PNDSB': 'N',
							'PVDSB': 'R',
							'PMDSBC': 'R',
							'PMDSBU': 'R',
							'PMDSBD': 'R',
							'PMDSPD': 'R',
							'PMDSPS': 'R',
							'PNDSPD': 'N',
							'PNDSPS': 'N'
						}
					},
					'document': {
						'_t': 'Number',
						'_p': {
							'PMDSD': 'R',
							'PMDSI': 'R',
							'PMDSE': 'R',
							'PMDSR': 'R',
							'PMDSS': 'R',
							'PVDSD': 'R',
							'PVDSI': 'R',
							'PVDSE': 'R',
							'PVDSR': 'R',
							'PVDSS': 'R',
							'PVDSA': 'R',
							'PNDSI': 'N',
							'PNDSS': 'N',
							////////////
							'PNDSB': 'N',
							'PVDSB': 'R',
							'PMDSBC': 'R',
							'PMDSBU': 'R',
							'PMDSBD': 'R',
							'PMDSPD': 'R',
							'PMDSPS': 'R',
							'PNDSPD': 'N',
							'PNDSPS': 'N'
						}
					}
				}
			},
			'role': {
				'_t': 'Object',
				'_p': {
					'PMDSD': 'N',
					'PMDSI': 'N',
					'PMDSE': 'N',
					'PMDSR': 'W',
					'PMDSS': 'N',
					'PVDSD': 'N',
					'PVDSI': 'N',
					'PVDSE': 'N',
					'PVDSR': 'R',
					'PVDSS': 'N',
					'PVDSA': 'N',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'N',
					'PMDSBC': 'N',
					'PMDSBU': 'N',
					'PMDSBD': 'N',
					'PMDSPD': 'N',
					'PMDSPS': 'N',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			},
			'enableSearchIndex': {
				'_t': 'Object',
				'_p': {
					'PMDSD': 'N',
					'PMDSI': 'N',
					'PMDSE': 'N',
					'PMDSR': 'N',
					'PMDSS': 'W',
					'PVDSD': 'N',
					'PVDSI': 'N',
					'PVDSE': 'N',
					'PVDSR': 'N',
					'PVDSS': 'R',
					'PVDSA': 'N',
					'PNDSI': 'N',
					'PNDSS': 'N',
					////////////
					'PNDSB': 'N',
					'PVDSB': 'N',
					'PMDSBC': 'N',
					'PMDSBU': 'N',
					'PMDSBD': 'N',
					'PMDSPD': 'N',
					'PMDSPS': 'N',
					'PNDSPD': 'N',
					'PNDSPS': 'N'
				}
			}
		}
	},
	{
		'entity': 'GS',
		'entityName': 'Library',
		'roles': [
			{ id: 'PML', name: 'Manage Library', operations: [{ method: 'PUT' }, { method: 'POST' }, { method: 'DELETE' }] },
			{ id: 'PVL', name: 'View Library', operations: [{ method: 'GET' }] },
			{ id: 'PNL', name: 'No Access Library', operations: [{ method: 'PUT' }, { method: 'POST' }, { method: 'DELETE' }, { method: 'GET' }] }
		],
		'default': 'R',
		'type': 'author',
		'fields': {
			'_id': {
				'_t': 'String',
				'_p': {
					'PNL': 'N',
					'PML': 'W',
					'PVL': 'R'
				}
			},
			'name': {
				'_t': 'String',
				'_p': {
					'PNL': 'N',
					'PML': 'W',
					'PVL': 'R'
				}
			},
			'app': {
				'_t': 'String',
				'_p': {
					'PNL': 'N',
					'PML': 'W',
					'PVL': 'R'
				}
			},
			'definition': {
				'_t': 'String',
				'_p': {
					'PNL': 'N',
					'PML': 'W',
					'PVL': 'R'
				}
			},
			'description': {
				'_t': 'String',
				'_p': {
					'PNL': 'N',
					'PML': 'W',
					'PVL': 'R'
				}
			}
			,
			'services': {
				'_t': 'Array',
				'_p': {
					'PNL': 'N',
					'PML': 'W',
					'PVL': 'R'
				}
			},
			'_metadata': {
				'lastUpdated': {
					'_t': 'Date',
					'_p': {
						'PNL': 'N',
						'PML': 'W',
						'PVL': 'R'
					}
				},
				'createdAt': {
					'_t': 'Date',
					'_p': {
						'PNL': 'N',
						'PML': 'W',
						'PVL': 'R'
					}
				},
				'version': {
					'release': {
						'_t': 'Number',
						'_p': {
							'PNL': 'N',
							'PML': 'W',
							'PVL': 'R'
						}
					},
					'document': {
						'_t': 'Number',
						'_p': {
							'PNL': 'N',
							'PML': 'W',
							'PVL': 'R'
						}
					}
				}
			},
			'attributeList': {
				'_t': 'Array',
				'_p': {
					'PNL': 'N',
					'PML': 'W',
					'PVL': 'R'
				}
			}
		}
	},
	{
		'entity': 'USER',
		'entityName': 'User',
		'type': 'author',
		'roles': [
			{ id: 'PMU', name: 'Manage Users', operations: [{ method: 'PUT' }, { method: 'POST' }, { method: 'GET' }] },
			{ id: 'PVU', name: 'View Users', operations: [{ method: 'GET' }] },
		],
		'default': 'R',
		'fields': {
			'_id': {
				'_t': 'String',
				'_p': {
					'PMU': 'R',
					'PVU': 'R'
				}
			},
			'username': {
				'_t': 'String',
				'_p': {
					'PMU': 'W',
					'PVU': 'R'
				}
			},
			'password': {
				'_t': 'String',
				'_p': {
					'PMU': 'W',
					'PVU': 'R'
				}
			},
			'isActive': {
				'_t': 'Boolean',
				'_p': {
					'PMU': 'W',
					'PVU': 'R'
				}
			},
			'roles': {
				'_t': 'Array',
				'_p': {
					'PMU': 'W',
					'PVU': 'R'
				}
			},
			'basicDetails': {
				'_t': 'Object',
				'_p': {
					'PMU': 'W',
					'PVU': 'R'
				}
			},
			'sessionTime': {
				'_t': 'Number',
				'_p': {
					'PMU': 'W',
					'PVU': 'R'
				}
			},
			'enableSessionRefresh': {
				'_t': 'Boolean',
				'_p': {
					'PMU': 'W',
					'PVU': 'R'
				}
			},
			'isSuperAdmin': {
				'_t': 'Boolean',
				'_p': {
					'PMU': 'W',
					'PVU': 'R'
				}
			},
			'description': {
				'_t': 'String',
				'_p': {
					'PMU': 'W',
					'PVU': 'R'
				}
			},
			'accessControl': {
				'_t': 'Object',
				'_p': {
					'PMU': 'W',
					'PVU': 'R'
				}
			},
			'auth': {
				'_t': 'Object',
				'_p': {
					'PMU': 'W',
					'PVU': 'R'
				}
			},
			'bot': {
				'_t': 'Boolean',
				'_p': {
					'PMU': 'W',
					'PVU': 'R'
				}
			},
			'attributes': {
				'_t': 'Object',
				'_p': {
					'PMU': 'W',
					'PVU': 'R'
				}
			},
			'_metadata': {
				'lastUpdated': {
					'_t': 'Date',
					'_p': {
						'PMU': 'R',
						'PVU': 'R'
					}
				},
				'createdAt': {
					'_t': 'Date',
					'_p': {
						'PMU': 'R',
						'PVU': 'R'
					}
				},
				'version': {
					'release': {
						'_t': 'Number',
						'_p': {
							'PMU': 'R',
							'PVU': 'R'
						}
					},
					'document': {
						'_t': 'Number',
						'_p': {
							'PMU': 'R',
							'PVU': 'R'
						}
					}
				}
			}
		}
	},
	{
		'entity': 'GROUP',
		'entityName': 'Group',
		'type': 'author',
		'roles': [
			{ id: 'PMG', name: 'Manage Groups', operations: [{ method: 'PUT' }, { method: 'POST' }, { method: 'DELETE' }, { method: 'GET' }] },
			{ id: 'PVG', name: 'View Groups', operations: [{ method: 'GET' }] },
		],
		'default': 'R',
		'fields': {
			'_id': {
				'_t': 'String',
				'_p': {
					'PMG': 'R',
					'PVG': 'R'
				}
			},
			'name': {
				'_t': 'String',
				'_p': {
					'PMG': 'W',
					'PVG': 'R'
				}
			},
			'description': {
				'_t': 'String',
				'_p': {
					'PMG': 'W',
					'PVG': 'R'
				}
			},
			'isActive': {
				'_t': 'Boolean',
				'_p': {
					'PMG': 'W',
					'PVG': 'R'
				}
			},
			'roles': {
				'_t': 'Array',
				'_p': {
					'PMG': 'W',
					'PVG': 'R'
				}
			},
			'users': {
				'_t': 'Array',
				'_p': {
					'PMG': 'W',
					'PVG': 'R'
				}
			},
			'_metadata': {
				'lastUpdated': {
					'_t': 'Date',
					'_p': {
						'PMG': 'R',
						'PVG': 'R'
					}
				},
				'createdAt': {
					'_t': 'Date',
					'_p': {
						'PMG': 'R',
						'PVG': 'R'
					}
				},
				'version': {
					'release': {
						'_t': 'Number',
						'_p': {
							'PMG': 'R',
							'PVG': 'R'
						}
					},
					'document': {
						'_t': 'Number',
						'_p': {
							'PMG': 'R',
							'PVG': 'R'
						}
					}
				}
			}
		}
	},
	{
		'entity': 'PM',
		'entityName': 'Partner Manager',
		'type': 'author',
		'roles': [
			{ id: 'PMPH', name: 'Manage Partner Headers', operations: [{ method: 'PUT' }] },
			{ id: 'PVPH', name: 'View Partner Header', operations: [{ method: 'GET' }] },
			////////////

			{ id: 'PVPB', name: 'View Partner', operations: [{ method: 'GET' }] },
			{ id: 'PNPB', name: 'No Access Partner', operations: [{ method: 'PUT' }, { method: 'POST' }, { method: 'DELETE' }, { method: 'GET' }] },
			{ id: 'PMPBC', name: 'Create Partner', operations: [{ method: 'POST' }] },
			{ id: 'PMPBU', name: 'Update Partner', operations: [{ method: 'PUT' }] },
			{ id: 'PMPBD', name: 'Delete Partner', operations: [{ method: 'DELETE' }] },
			{ id: 'PNPFMB', name: 'No Access Partner flow', operations: [{ method: 'PUT' }, { method: 'POST' }, { method: 'DELETE' }, { method: 'GET' }] },
			{ id: 'PVPFMB', name: 'View Partner Flow', operations: [{ method: 'GET' }] },
			{ id: 'PMPFMBC', name: 'Create Partner Flow', operations: [{method: 'POST' }] },
			{ id: 'PMPFMBU', name: 'Update Partner Flow', operations: [{ method: 'PUT' }] },
			{ id: 'PMPFMBD', name: 'Delete Partner Flow', operations: [{ method: 'DELETE' },] },
			{ id: 'PNPFPD', name: 'No Access Partner flow Deploy', operations: [{ method: 'PUT' }, { method: 'POST' }, { method: 'DELETE' }, { method: 'GET' }] },
			{ id: 'PNPFPS', name: 'No Access Partner flow start/stop', operations: [{ method: 'PUT' }, { method: 'POST' }, { method: 'DELETE' }, { method: 'GET' }] },
			{ id: 'PMPFPD', name: 'Manage Partner flow Deploy', operations: [{ method: 'PUT' }] },
			{ id: 'PMPFPS', name: 'Manage Partner flow Start/Stop', operations: [{ method: 'PUT' }] },
			{ id: 'PNPP', name: 'No Access Partner Profile', operations: [{ method: 'PUT' }, { method: 'POST' }, { method: 'DELETE' }, { method: 'GET' }] },
			{ id: 'PMPPC', name: 'Manage Partner Profile Create', operations: [{ method: 'POST' }, { method: 'PUT' }] },
			{ id: 'PMPPD', name: 'Manage Partner Profile Delete', operations: [{ method: 'DELETE' }, { method: 'PUT' }] },
			{ id: 'PNPH', name: 'No Access Partner Headers', operations: [{ method: 'PUT' }, { method: 'POST' }, { method: 'DELETE' }, { method: 'GET' }] },
			{ id: 'PNPM', name: 'No Access Partner Management Tab', operations: [{ method: 'PUT' }, { method: 'POST' }, { method: 'DELETE' }, { method: 'GET' }] },
			{ id: 'PMPM', name: 'Manage Access Partner Management Tab', operations: [{ method: 'PUT' }, { method: 'POST' }, { method: 'DELETE' }, { method: 'GET' }] },
		],
		'default': 'R',
		'fields': {
			'_id': {
				'_t': 'String',
				'_p': {
					'PMPH': 'R',
					'PVPH': 'R',
					'PVPP': 'R',
					////
					'PVPB': 'R',
					'PNPB': 'R',
					'PMPBC': 'W',
					'PMPBU': 'W',
					'PMPBD': 'R',
					'PNPFMB': 'R',
					'PVPFMB': 'R',
					'PMPFMBC': 'R',
					'PMPFMBD': 'R',
					'PMPFMBU': 'R',
					'PNPFPD': 'R',
					'PNPFPS': 'R',
					'PMPFPD': 'R',
					'PMPFPS': 'R',
					'PNPP': 'R',
					'PMPPC': 'R',
					'PMPPD': 'R',
					'PNPH': 'R'
				}
			},
			'app': {
				'_t': 'String',
				'_p': {
					'PMPH': 'R',
					'PVPH': 'R',
					////
					'PVPB': 'R',
					'PNPB': 'N',
					'PMPBC': 'W',
					'PMPBU': 'W',
					'PMPBD': 'R',
					'PNPFMB': 'R',
					'PVPFMB': 'R',
					'PMPFMBC': 'R',
					'PMPFMBD': 'R',
					'PMPFMBU': 'R',
					'PNPFPD': 'R',
					'PNPFPS': 'R',
					'PMPFPD': 'R',
					'PMPFPS': 'R',
					'PNPP': 'R',
					'PVPP': 'R',
					'PMPPC': 'R',
					'PMPPD': 'R',
					'PNPH': 'R'
				}
			},
			'name': {
				'_t': 'String',
				'_p': {
					'PMPH': 'R',
					'PVPH': 'R',
					////
					'PVPB': 'R',
					'PNPB': 'N',
					'PMPBC': 'W',
					'PMPBU': 'W',
					'PMPBD': 'R',
					'PNPFMB': 'R',
					'PVPFMB': 'R',
					'PMPFMBC': 'R',
					'PMPFMBD': 'R',
					'PMPFMBU': 'R',
					'PNPFPD': 'R',
					'PNPFPS': 'R',
					'PMPFPD': 'R',
					'PMPFPS': 'R',
					'PNPP': 'R',
					'PVPP': 'R',
					'PMPPC': 'R',
					'PMPPD': 'R',
					'PNPH': 'R'
				}
			},
			'description': {
				'_t': 'String',
				'_p': {
					'PMPH': 'R',
					'PVPH': 'R',
					////
					'PVPB': 'R',
					'PNPB': 'N',
					'PMPBC': 'W',
					'PMPBU': 'W',
					'PMPBD': 'R',
					'PNPFMB': 'R',
					'PVPFMB': 'R',
					'PMPFMBC': 'R',
					'PMPFMBD': 'R',
					'PMPFMBU': 'R',
					'PNPFPD': 'R',
					'PNPFPS': 'R',
					'PMPFPD': 'R',
					'PMPFPS': 'R',
					'PNPP': 'R',
					'PVPP': 'R',
					'PMPPC': 'R',
					'PMPPD': 'R',
					'PNPH': 'R'
				}
			},
			'logo': {
				'_t': 'String',
				'_p': {
					'PMPH': 'R',
					'PVPH': 'R',
					////
					'PVPB': 'R',
					'PNPB': 'N',
					'PMPBC': 'W',
					'PMPBU': 'W',
					'PMPBD': 'R',
					'PNPFMB': 'N',
					'PVPFMB': 'R',
					'PMPFMBC': 'R',
					'PMPFMBD': 'R',
					'PMPFMBU': 'R',
					'PNPFPD': 'R',
					'PNPFPS': 'R',
					'PMPFPD': 'R',
					'PMPFPS': 'R',
					'PNPP': 'N',
					'PVPP': 'R',
					'PMPPC': 'R',
					'PMPPD': 'R',
					'PNPH': 'N'
				}
			},
			'status': {
				'_t': 'String',
				'_p': {
					'PMPH': 'N',
					'PVPH': 'N',
					////
					'PVPB': 'N',
					'PNPB': 'N',
					'PMPBC': 'N',
					'PMPBU': 'N',
					'PMPBD': 'N',
					'PNPFMB': 'R',
					'PVPFMB': 'R',
					'PMPFMBC': 'W',
					'PMPFMBD': 'W',
					'PMPFMBU': 'W',
					'PNPFPD': 'N',
					'PNPFPS': 'N',
					'PMPFPD': 'W',
					'PMPFPS': 'W',
					'PNPP': 'N',
					'PVPP': 'N',
					'PMPPC': 'N',
					'PMPPD': 'N',
					'PNPH': 'N'
				}
			},
			'comment': {
				'_t': 'String',
				'_p': {
					'PMPH': 'N',
					'PVPH': 'N',
					////
					'PVPB': 'R',
					'PNPB': 'N',
					'PMPBC': 'W',
					'PMPBU': 'W',
					'PMPBD': 'R',
					'PNPFMB': 'N',
					'PVPFMB': 'N',
					'PMPFMBC': 'N',
					'PMPFMBD': 'N',
					'PMPFMBU': 'N',
					'PNPFPD': 'N',
					'PNPFPS': 'N',
					'PMPFPD': 'N',
					'PMPFPS': 'N',
					'PNPP': 'N',
					'PVPP': 'N',
					'PMPPC': 'N',
					'PMPPD': 'N',
					'PNPH': 'N'
				}
			},
			'secrets': {
				'_t': 'Array',
				'_p': {
					'PMPH': 'N',
					'PVPH': 'N',
					////
					'PVPB': 'N',
					'PNPB': 'N',
					'PMPBC': 'N',
					'PMPBU': 'N',
					'PMPBD': 'N',
					'PNPFMB': 'N',
					'PVPFMB': 'N',
					'PMPFMBC': 'N',
					'PMPFMBD': 'N',
					'PMPFMBU': 'N',
					'PNPFPD': 'N',
					'PNPFPS': 'N',
					'PMPFPD': 'N',
					'PMPFPS': 'N',
					'PNPP': 'N',
					'PVPP': 'R',
					'PMPPC': 'W',
					'PMPPD': 'W',
					'PNPH': 'N'
				}
			},
			'flows': {
				'_t': 'Array',
				'_p': {
					'PMPH': 'N',
					'PVPH': 'N',
					////
					'PVPB': 'N',
					'PNPB': 'N',
					'PMPBC': 'N',
					'PMPBU': 'N',
					'PMPBD': 'N',
					'PNPFMB': 'N',
					'PVPFMB': 'R',
					'PMPFMBC': 'W',
					'PMPFMBD': 'W',
					'PMPFMBU': 'W',
					'PNPFPD': 'N',
					'PNPFPS': 'N',
					'PMPFPD': 'R',
					'PMPFPS': 'R',
					'PNPP': 'N',
					'PVPP': 'N',
					'PMPPC': 'N',
					'PMPPD': 'N',
					'PNPH': 'N'
				}
			},
			'notifications': {
				'_t': 'Array',
				'_p': {
					'PMPH': 'N',
					'PVPH': 'N',
					////
					'PVPB': 'R',
					'PNPB': 'R',
					'PMPBC': 'R',
					'PMPBU': 'R',
					'PMPBD': 'R',
					'PNPFMB': 'R',
					'PVPFMB': 'R',
					'PMPFMBC': 'R',
					'PMPFMBD': 'R',
					'PMPFMBU': 'R',
					'PNPFPD': 'R',
					'PNPFPS': 'R',
					'PMPFPD': 'R',
					'PMPFPS': 'R',
					'PNPP': 'R',
					'PVPP': 'R',
					'PMPPC': 'R',
					'PMPPD': 'R',
					'PNPH': 'R'
				}
			},
			'agentID': {
				'_t': 'String',
				'_p': {
					'PMPH': 'N',
					'PVPH': 'N',
					////
					'PVPB': 'N',
					'PNPB': 'N',
					'PMPBC': 'N',
					'PMPBU': 'N',
					'PMPBD': 'N',
					'PNPFMB': 'N',
					'PVPFMB': 'R',
					'PMPFMBC': 'R',
					'PMPFMBD': 'R',
					'PMPFMBU': 'R',
					'PNPFPD': 'N',
					'PNPFPS': 'N',
					'PMPFPD': 'R',
					'PMPFPS': 'R',
					'PNPP': 'N',
					'PVPP': 'N',
					'PMPPC': 'N',
					'PMPPD': 'N',
					'PNPH': 'N'
				}
			},
			'serverReadTimeout': {
				'_t': 'String',
				'_p': {
					'PMPH': 'N',
					'PVPH': 'N',
					////
					'PVPB': 'R',
					'PNPB': 'N',
					'PMPBC': 'R',
					'PMPBU': 'R',
					'PMPBD': 'R',
					'PNPFMB': 'R',
					'PVPFMB': 'R',
					'PMPFMBC': 'R',
					'PMPFMBD': 'R',
					'PMPFMBU': 'R',
					'PNPFPD': 'R',
					'PNPFPS': 'R',
					'PMPFPD': 'R',
					'PMPFPS': 'R',
					'PNPP': 'R',
					'PVPP': 'R',
					'PMPPC': 'R',
					'PMPPD': 'R',
					'PNPH': 'R'
				}
			},
			'serverWriteTimeout': {
				'_t': 'String',
				'_p': {
					'PMPH': 'N',
					'PVPH': 'N',
					////
					'PVPB': 'R',
					'PNPB': 'R',
					'PMPBC': 'R',
					'PMPBU': 'R',
					'PMPBD': 'R',
					'PNPFMB': 'R',
					'PVPFMB': 'R',
					'PMPFMBC': 'R',
					'PMPFMBD': 'R',
					'PMPFMBU': 'R',
					'PNPFPD': 'R',
					'PNPFPS': 'R',
					'PMPFPD': 'R',
					'PMPFPS': 'R',
					'PNPP': 'R',
					'PVPP': 'R',
					'PMPPC': 'R',
					'PMPPD': 'R',
					'PNPH': 'R'
				}
			},
			'headers': {
				'_t': 'String',
				'_p': {
					'PMPH': 'W',
					'PVPH': 'R',
					////
					'PVPB': 'N',
					'PNPB': 'N',
					'PMPBC': 'N',
					'PMPBU': 'N',
					'PMPBD': 'N',
					'PNPFMB': 'N',
					'PVPFMB': 'N',
					'PMPFMBC': 'N',
					'PMPFMBD': 'N',
					'PMPFMBU': 'N',
					'PNPFPD': 'N',
					'PNPFPS': 'N',
					'PMPFPD': 'N',
					'PMPFPS': 'N',
					'PNPP': 'N',
					'PVPP': 'N',
					'PMPPC': 'N',
					'PMPPD': 'N',
					'PNPH': 'N'
				}
			},
			'_metadata': {
				'_t': 'String',
				'_p': {
					'PMPH': 'R',
					'PVPH': 'R',
					////
					'PVPB': 'R',
					'PNPB': 'N',
					'PMPBC': 'W',
					'PMPBU': 'W',
					'PMPBD': 'W',
					'PNPFMB': 'R',
					'PVPFMB': 'R',
					'PMPFMBC': 'R',
					'PMPFMBD': 'R',
					'PMPFMBU': 'R',
					'PNPFPD': 'R',
					'PNPFPS': 'R',
					'PMPFPD': 'R',
					'PMPFPS': 'R',
					'PNPP': 'N',
					'PVPP': 'R',
					'PMPPC': 'R',
					'PMPPD': 'R',
					'PNPH': 'N'
				}
			}
		}
	},
	{
		'entity': 'NS',
		'entityName': 'Nano Service',
		'type': 'author',
		'roles': [
			{ id: 'PVNSB', name: 'View Nano Service Basic Details', operations: [{ method: 'GET' }] },
			{ id: 'PNNSB', name: 'No Access Nano Service', operations: [{ method: 'PUT' }, { method: 'POST' }, { method: 'DELETE' }, { method: 'GET' }] },
			{ id: 'PMNSBC', name: 'Create Nano Servcie', operations: [{ method: 'POST' }] },
			{ id: 'PMNSBU', name: 'Update Nano Service', operations: [{ method: 'PUT' }] },
			{ id: 'PMNSBD', name: 'Delete Nano Service', operations: [{ method: 'DELETE' }] },
			{ id: 'PMNSIO', name: 'Manage input/output', operations: [{ method: 'PUT' }, { method: 'POST' }] },
			{ id: 'PVNSIO', name: 'View input/output', operations: [{ method: 'GET' }] },
			{ id: 'PNNSIO', name: 'No Access input/output', operations: [{ method: 'PUT' }, { method: 'POST' }, { method: 'DELETE' }, { method: 'GET' }] },
			{ id: 'PVNSURL', name: 'View URL', operations: [{ method: 'GET' }] },
			{ id: 'PMNSURL', name: 'Manage URL', operations: [{ method: 'PUT' }, { method: 'POST' }] },
			{ id: 'PNNSURL', name: 'No Access URL', operations: [{ method: 'PUT' }, { method: 'POST' }, { method: 'DELETE' }, { method: 'GET' }] },
			{ id: 'PVNSH', name: 'View Headers', operations: [ { method: 'GET' }] },
			{ id: 'PMNSH', name: 'Manage Headers', operations: [{ method: 'PUT' }, { method: 'POST' }] },
			{ id: 'PNNSH', name: 'No Access Headers', operations: [{ method: 'PUT' }, { method: 'POST' }, { method: 'DELETE' }, { method: 'GET' }] },
		],
		'default': 'R',
		'fields': {
			'_id': {
				'_t': 'String',
				'_p': {
					'PVNSB': 'R',
					'PNNSB': 'N',
					'PMNSBC': 'W',
					'PMNSBU': 'W',
					'PMNSBD': 'R',
					'PNNSIO': 'N',
					'PMNSIO': 'R',
					'PVNSIO': 'R',
					'PVNSURL': 'R',
					'PMNSURL': 'R',
					'PNNSURL': 'N',
					'PVNSH': 'R',
					'PMNSH': 'R',
					'PNNSH': 'R'
				}
			},
			'app': {
				'_t': 'String',
				'_p': {
					'PVNSB': 'R',
					'PNNSB': 'N',
					'PMNSBC': 'W',
					'PMNSBU': 'W',
					'PMNSBD': 'R',
					'PNNSIO': 'N',
					'PMNSIO': 'R',
					'PVNSIO': 'R',
					'PVNSURL': 'R',
					'PMNSURL': 'R',
					'PNNSURL': 'N',
					'PVNSH': 'R',
					'PMNSH': 'R',
					'PNNSH': 'N'
				}
			},
			'name': {
				'_t': 'String',
				'_p': {
					'PVNSB': 'R',
					'PNNSB': 'N',
					'PMNSBC': 'W',
					'PMNSBU': 'W',
					'PMNSBD': 'R',
					'PNNSIO': 'N',
					'PMNSIO': 'R',
					'PVNSIO': 'R',
					'PVNSURL': 'R',
					'PMNSURL': 'R',
					'PNNSURL': 'N',
					'PVNSH': 'R',
					'PMNSH': 'R',
					'PNNSH': 'N'
				}
			},
			'description': {
				'_t': 'String',
				'_p': {
					'PVNSB': 'R',
					'PNNSB': 'N',
					'PMNSBC': 'W',
					'PMNSBU': 'W',
					'PMNSBD': 'R',
					'PNNSIO': 'N',
					'PMNSIO': 'R',
					'PVNSIO': 'R',
					'PVNSURL': 'R',
					'PMNSURL': 'R',
					'PNNSURL': 'N',
					'PVNSH': 'R',
					'PMNSH': 'R',
					'PNNSH': 'N'
				}
			},
			'in': {
				'_t': 'String',
				'_p': {
					'PVNSB': 'N',
					'PNNSB': 'N',
					'PMNSBC': 'N',
					'PMNSBU': 'N',
					'PMNSBD': 'N',
					'PNNSIO': 'N',
					'PMNSIO': 'W',
					'PVNSIO': 'R',
					'PVNSURL': 'N',
					'PMNSURL': 'N',
					'PNNSURL': 'N',
					'PVNSH': 'N',
					'PMNSH': 'N',
					'PNNSH': 'N'
				}
			},
			'out': {
				'_t': 'String',
				'_p': {
					'PVNSB': 'N',
					'PNNSB': 'N',
					'PMNSBC': 'N',
					'PMNSBU': 'N',
					'PMNSBD': 'N',
					'PNNSIO': 'N',
					'PMNSIO': 'W',
					'PVNSIO': 'R',
					'PVNSURL': 'N',
					'PMNSURL': 'N',
					'PNNSURL': 'N',
					'PVNSH': 'N',
					'PMNSH': 'N',
					'PNNSH': 'N'
				}
			},
			'url': {
				'_t': 'String',
				'_p': {
					'PVNSB': 'N',
					'PNNSB': 'N',
					'PMNSBC': 'N',
					'PMNSBU': 'N',
					'PMNSBD': 'N',
					'PNNSIO': 'N',
					'PMNSIO': 'N',
					'PVNSIO': 'N',
					'PVNSURL': 'R',
					'PMNSURL': 'W',
					'PNNSURL': 'N',
					'PVNSH': 'N',
					'PMNSH': 'N',
					'PNNSH': 'N'
				}
			},
			'allowTrustedConnections': {
				'_t': 'Array',
				'_p': {
					'PVNSB': 'N',
					'PNNSB': 'N',
					'PMNSBC': 'N',
					'PMNSBU': 'N',
					'PMNSBD': 'N',
					'PNNSIO': 'N',
					'PMNSIO': 'N',
					'PVNSIO': 'N',
					'PVNSURL': 'R',
					'PMNSURL': 'W',
					'PNNSURL': 'N',
					'PVNSH': 'N',
					'PMNSH': 'N',
					'PNNSH': 'N'
				}
			},
			'headers': {
				'_t': 'Array',
				'_p': {
					'PVNSB': 'N',
					'PNNSB': 'N',
					'PMNSBC': 'N',
					'PMNSBU': 'N',
					'PMNSBD': 'N',
					'PNNSIO': 'N',
					'PMNSIO': 'N',
					'PVNSIO': 'N',
					'PVNSURL': 'N',
					'PMNSURL': 'N',
					'PNNSURL': 'N',
					'PVNSH': 'R',
					'PMNSH': 'W',
					'PNNSH': 'N'
				}
			},
			'_metadata': {
				'_t': 'Array',
				'_p': {
					'PVNSB': 'R',
					'PNNSB': 'N',
					'PMNSBC': 'W',
					'PMNSBU': 'W',
					'PMNSBD': 'R',
					'PNNSIO': 'R',
					'PMNSIO': 'R',
					'PVNSIO': 'R',
					'PVNSURL': 'R',
					'PMNSURL': 'R',
					'PNNSURL': 'R',
					'PVNSH': 'R',
					'PMNSH': 'R',
					'PNNSH': 'R'
				}
			}
		}
	},
	{
		'entity': 'FAAS',
		'entityName': 'Functions',
		'roles': [
			{ id: 'PMF', name: 'Manage Functions', operations: [{ method: 'PUT' }, { method: 'POST' }, { method: 'DELETE' }] },
			{ id: 'PVF', name: 'View Functions', operations: [{ method: 'GET' }] },
			{ id: 'PNF', name: 'No Access Functions', operations: [{ method: 'PUT' }, { method: 'POST' }, { method: 'DELETE' }, { method: 'GET' }] }
		],
		'default': 'R',
		'type': 'author',
		'fields': {
			'_id': {
				'_t': 'String',
				'_p': {
					'PMF': 'W',
					'PVF': 'R',
					'PNF': 'N'
				}
			},
			'name': {
				'_t': 'String',
				'_p': {
					'PMF': 'W',
					'PVF': 'R',
					'PNF': 'N'
				}
			},
			'app': {
				'_t': 'String',
				'_p': {
					'PMF': 'W',
					'PVF': 'R',
					'PNF': 'N'
				}
			},
			'description': {
				'_t': 'String',
				'_p': {
					'PMF': 'W',
					'PVF': 'R',
					'PNF': 'N'
				}
			},
			'collectionName': {
				'_t': 'String',
				'_p': {
					'PMF': 'N',
					'PVF': 'N',
					'PNF': 'N'
				}
			},
			'deploymentName': {
				'_t': 'String',
				'_p': {
					'PMF': 'N',
					'PVF': 'N',
					'PNF': 'N'
				}
			},
			'namespace': {
				'_t': 'String',
				'_p': {
					'PMF': 'N',
					'PVF': 'N',
					'PNF': 'N'
				}
			},
			'url': {
				'_t': 'String',
				'_p': {
					'PMF': 'W',
					'PVF': 'R',
					'PNF': 'N'
				}
			},
			'port': {
				'_t': 'Number',
				'_p': {
					'PMF': 'W',
					'PVF': 'R',
					'PNF': 'N'
				}
			},
			'code': {
				'_t': 'String',
				'_p': {
					'PMF': 'W',
					'PVF': 'R',
					'PNF': 'N'
				}
			},
			'headers': {
				'_t': 'Object',
				'_p': {
					'PMF': 'N',
					'PVF': 'N',
					'PNF': 'N'
				}
			},
			'version': {
				'_t': 'Number',
				'_p': {
					'PMF': 'R',
					'PVF': 'R',
					'PNF': 'N'
				}
			},
			'status': {
				'_t': 'String',
				'_p': {
					'PMF': 'W',
					'PVF': 'R',
					'PNF': 'N'
				}
			},
			'draftVersion': {
				'_t': 'Number',
				'_p': {
					'PMF': 'W',
					'PVF': 'R',
					'PNF': 'N'
				}
			},
			'lastInvoked': {
				'_t': 'Date',
				'_p': {
					'PMF': 'R',
					'PVF': 'R',
					'PNF': 'N'
				}
			},
			'_metadata': {
				'lastUpdatedBy': {
					'_t': 'String',
					'_p': {
						'PMF': 'W',
						'PVF': 'R',
						'PNF': 'N'
					}
				},
				'version': {
					'release': {
						'_t': 'Number',
						'_p': {
							'PMF': 'W',
							'PVF': 'R',
							'PNF': 'N',
						}
					}
				}
			}
		}
	},
];
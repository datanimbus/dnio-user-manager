const data = [
	{
		category: 'DB',
		type: 'MONGODB',
		label: 'MongoDB',
		fields: [
			{
				type: 'String',
				key: 'connectionString',
				label: 'Connection String',
				htmlInputType: 'textarea',
				encrypted: false,
				required: true
			},
			{
				type: 'String',
				key: 'database',
				label: 'Database Name',
				htmlInputType: 'text',
				encrypted: false,
				required: true
			}
		]
	},
	{
		category: 'DB',
		type: 'MYSQL',
		label: 'MySQL',
		fields: [
			{
				type: 'String',
				key: 'host',
				label: 'MySQL Host',
				htmlInputType: 'text',
				required: true
			},
			{
				type: 'Number',
				key: 'port',
				label: 'MySQL Port',
				htmlInputType: 'number'
			},
			{
				type: 'String',
				key: 'user',
				label: 'MySQL User',
				htmlInputType: 'text',
				required: true
			},
			{
				type: 'String',
				key: 'password',
				label: 'MySQL Password',
				htmlInputType: 'password',
				encrypted: true,
				required: true
			},
			{
				type: 'String',
				key: 'database',
				label: 'MySQL Database Name',
				htmlInputType: 'text',
				required: true
			}
		]
	},
	{
		category: 'DB',
		type: 'PGSQL',
		label: 'PostgreSQL',
		fields: [
			{
				type: 'String',
				key: 'host',
				label: 'PostgreSQL Host',
				htmlInputType: 'text',
				required: true
			},
			{
				type: 'Number',
				key: 'port',
				label: 'PostgreSQL Port',
				htmlInputType: 'number'
			},
			{
				type: 'String',
				key: 'user',
				label: 'PostgreSQL User',
				htmlInputType: 'text',
				required: true
			},
			{
				type: 'String',
				key: 'password',
				label: 'PostgreSQL Password',
				htmlInputType: 'password',
				encrypted: true,
				required: true
			},
			{
				type: 'String',
				key: 'database',
				label: 'PostgreSQL Database Name',
				htmlInputType: 'text',
				required: true
			}
		]
	},
	{
		category: 'DB',
		type: 'MSSQL',
		label: 'MSSQL',
		fields: [
			{
				type: 'String',
				key: 'connectionString',
				label: 'Connection String',
				htmlInputType: 'textarea',
				encrypted: true,
				required: true
			}
		]
	},
	{
		category: 'FILE',
		type: 'SFTP',
		label: 'SFTP',
		fields: [
			{
				type: 'String',
				key: 'host',
				label: 'SFTP Host',
				htmlInputType: 'text',
				required: true
			},
			{
				type: 'Number',
				key: 'port',
				label: 'SFTP Port',
				htmlInputType: 'number'
			},
			{
				type: 'String',
				key: 'user',
				label: 'SFTP User',
				htmlInputType: 'text',
				required: true
			},
			{
				type: 'String',
				key: 'authType',
				label: 'SFTP Auth Type',
				htmlInputType: 'select',
				options: [
					{
						label: 'None',
						value: 'none'
					},
					{
						label: 'Password',
						value: 'password'
					},
					{
						label: 'Public Key',
						value: 'publickey'
					}
				],
				required: true
			},
			{
				type: 'String',
				key: 'password',
				label: 'SFTP Password',
				htmlInputType: 'password',
				condition: { 
					authType: 'password'
				},
				encrypted: true
			},
			{
				type: 'String',
				key: 'publicKey',
				label: 'SFTP Public Key',
				htmlInputType: 'textarea',
				condition: { 
					authType: 'publickey'
				},
				encrypted: true
			},
			{
				type: 'String',
				key: 'password',
				label: 'SFTP Public Key Passphrase',
				htmlInputType: 'password',
				condition: { 
					authType: 'publickey'
				},
				encrypted: true
			}
		]
	},
	{
		category: 'MESSAGING',
		type: 'KAFKA',
		label: 'Apache Kafka',
		fields: [
			{
				type: 'String',
				key: 'servers',
				label: 'Bootstrap Servers',
				htmlInputType: 'textarea',
				required: true
			},
			{
				type: 'String',
				key: 'user',
				label: 'User',
				htmlInputType: 'text'
			},
			{
				type: 'String',
				key: 'password',
				label: 'Password',
				htmlInputType: 'password',
				encrypted: true
			},
			{
				type: 'String',
				key: 'protocol',
				label: 'Security Protocol',
				htmlInputType: 'select',
				options: [
					{
						label: 'PLAINTEXT',
						value: 'plaintext'
					},
					{
						label: 'SASL_PLAINTEXT',
						value: 'sasl_plaintext'
					},
					{
						label: 'SASL_SSL',
						value: 'sasl_ssl'
					},
					{
						label: 'SSL',
						value: 'ssl'
					}
				],
			},
			{
				type: 'String',
				key: 'mechanisms',
				label: 'Mechanisms',
				htmlInputType: 'text'
			}
		]
	},
	{
		category: 'STORAGE',
		type: 'GRIDFS',
		label: 'MongoDB GridFS',
		fields: [
			{
				type: 'String',
				key: 'connectionString',
				label: 'Connection String',
				htmlInputType: 'textarea',
				encrypted: true,
				required: true
			}
		]
	},
	{
		category: 'STORAGE',
		type: 'AZBLOB',
		label: 'Azure Blob Storage',
		fields: [
			{
				type: 'String',
				key: 'connectionString',
				label: 'Connection URL',
				htmlInputType: 'text',
				required: true
			},
			{
				type: 'String',
				key: 'container',
				label: 'Container Name',
				htmlInputType: 'text',
				required: true
			},
			{
				type: 'String',
				key: 'sharedKey',
				label: 'Shared Key',
				htmlInputType: 'text',
				encrypted: true,
				required: true
			},
			{
				type: 'String',
				key: 'timeout',
				label: 'Link Validity',
				htmlInputType: 'text'
			}
		]
	},
	{
		category: 'STORAGE',
		type: 'S3',
		label: 'Amazon S3',
		fields: [
			{
				type: 'String',
				key: 'secretAccessKey',
				label: 'IAM User Secret Access Key',
				htmlInputType: 'password',
				encrypted: true,
				required: true
			},
			{
				type: 'String',
				key: 'accessKeyId',
				label: 'IAM User Access Key ID',
				htmlInputType: 'text',
				required: true
			},
			{
				type: 'String',
				key: 'region',
				label: 'Amazon S3 Bucket Region',
				htmlInputType: 'text',
				required: true
			},
			{
				type: 'String',
				key: 'bucket',
				label: 'Amazon S3 Bucket Name',
				htmlInputType: 'text',
				required: true
			}
		]
	},
	{
		category: 'STORAGE',
		type: 'GCS',
		label: 'Google Cloud Storage',
		fields: [
			{
				type: 'String',
				key: 'projectId',
				label: 'GCS Project Id',
				htmlInputType: 'text',
				required: true
			},
			{
				type: 'String',
				key: 'gcsKeyFile',
				label: 'GCS Service Account Key File',
				htmlInputType: 'textarea',
				required: true
			},
			{
				type: 'String',
				key: 'bucket',
				label: 'GCS Bucket Name',
				htmlInputType: 'text',
				required: true
			}
		]
	}
];

module.exports.data = data;

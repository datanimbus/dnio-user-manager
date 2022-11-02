const data = [
	{
		category: 'DB',
		type: 'MongoDB',
		label: 'MongoDB',
		fields: [
			{
				type: 'String',
				key: 'connectionString',
				label: 'Connection String',
				htmlInputType: 'text'
			}
		]
	},
	{
		category: 'DB',
		type: 'MySQL',
		label: 'MySQL',
		fields: [
			{
				type: 'String',
				key: 'host',
				label: 'MySQL Host',
				htmlInputType: 'text'
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
				htmlInputType: 'text'
			},
			{
				type: 'String',
				key: 'password',
				label: 'MySQL Password',
				htmlInputType: 'password'
			}
		]
	},
	{
		category: 'DB',
		type: 'PostgreSQL',
		label: 'PostgreSQL',
		fields: [
			{
				type: 'String',
				key: 'host',
				label: 'PostgreSQL Host',
				htmlInputType: 'text'
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
				htmlInputType: 'text'
			},
			{
				type: 'String',
				key: 'password',
				label: 'PostgreSQL Password',
				htmlInputType: 'password'
			}
		]
	},
	{
		category: 'SFTP',
		type: 'SFTP',
		label: 'SFTP',
		fields: [
			{
				type: 'String',
				key: 'host',
				label: 'SFTP Host',
				htmlInputType: 'text'
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
				htmlInputType: 'text'
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
				]
			},
			{
				type: 'String',
				key: 'password',
				label: 'SFTP Password',
				htmlInputType: 'password',
				authType: 'password'
			},
			{
				type: 'String',
				key: 'publicKey',
				label: 'SFTP Public Key',
				htmlInputType: 'textarea',
				authType: 'publickey'
			},
			{
				type: 'String',
				key: 'password',
				label: 'SFTP Public Key Passphrase',
				htmlInputType: 'password',
				authType: 'publickey'
			}
		]
	},
	{
		category: 'MESSAGING',
		type: 'Apache Kafka',
		label: 'Apache Kafka',
		fields: [
			{
				type: 'String',
				key: 'servers',
				label: 'Bootstrap Servers',
				htmlInputType: 'textarea'
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
				htmlInputType: 'password'
			},
			{
				type: 'String',
				key: 'protocol',
				label: 'Security Protocol',
				htmlInputType: 'text'
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
		type: 'Azure Blob Storage',
		label: 'Azure Blob Storage',
		fields: [
			{
				type: 'String',
				key: 'connectionString',
				label: 'Connection URL',
				htmlInputType: 'text'
			},
			{
				type: 'String',
				key: 'container',
				label: 'Container Name',
				htmlInputType: 'text'
			},
			{
				type: 'String',
				key: 'sharedKey',
				label: 'Shared Key',
				htmlInputType: 'text'
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
		type: 'Amazon S3',
		label: 'Amazon S3',
		fields: [
			{
				type: 'String',
				key: 'secretAccessKey',
				label: 'IAM User Secret Access Key',
				htmlInputType: 'password'
			},
			{
				type: 'String',
				key: 'accessKeyId',
				label: 'IAM User Access Key ID',
				htmlInputType: 'text'
			},
			{
				type: 'String',
				key: 'region',
				label: 'Amazon S3 Bucket Region',
				htmlInputType: 'text'
			},
			{
				type: 'String',
				key: 'bucket',
				label: 'Amazon S3 Bucket Name',
				htmlInputType: 'text'
			}
		]
	},
	{
		category: 'STORAGE',
		type: 'Google Cloud Storage',
		label: 'Google Cloud Storage',
		fields: [
			{
				type: 'String',
				key: 'projectId',
				label: 'GCS Project ID',
				htmlInputType: 'text'
			},
			{
				type: 'String',
				key: 'privateKeyId',
				label: 'GCS IAM Service Account Private Key ID',
				htmlInputType: 'text'
			},
			{
				type: 'String',
				key: 'privateKey',
				label: 'GCS IAM Service Account Private Key ID',
				htmlInputType: 'textarea'
			},
			{
				type: 'String',
				key: 'clientEmail',
				label: 'GCS Service Account Email',
				htmlInputType: 'text'
			},
			{
				type: 'String',
				key: 'clientId',
				label: 'GCS Service Account Unique Client ID',
				htmlInputType: 'text'
			},
			{
				type: 'String',
				key: 'authURI',
				label: 'GCS Service Account Auth URI',
				htmlInputType: 'text'
			},
			{
				type: 'String',
				key: 'tokenURI',
				label: 'GCS Service Account Token URI',
				htmlInputType: 'text'
			},
			{
				type: 'String',
				key: 'authCertURL',
				label: 'GCS Auth Provider Cert URL',
				htmlInputType: 'text'
			},
			{
				type: 'String',
				key: 'clientCertURL',
				label: 'GCS Client Cert URL',
				htmlInputType: 'text'
			},
			{
				type: 'String',
				key: 'bucket',
				label: 'GCS Bucket Name',
				htmlInputType: 'text'
			}
		]
	}
];

module.exports.data = data;

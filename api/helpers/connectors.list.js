const data = [
	{
		type: 'MONGODB',
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
		type: 'MYSQL',
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
		type: 'PG',
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
				key: 'sftpAuthType',
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
		type: 'KAFKA',
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
		type: 'AZBLOB',
		label: 'Azure Blob',
		fields: [
			{
				type: 'String',
				key: 'connectionString',
				label: 'Azure Connection URL',
				htmlInputType: 'text'
			},
			{
				type: 'String',
				key: 'container',
				label: 'Azure Container Name',
				htmlInputType: 'text'
			},
			{
				type: 'String',
				key: 'sharedKey',
				label: 'Azure Shared Key',
				htmlInputType: 'text'
			},
			{
				type: 'String',
				key: 'timeout',
				label: 'Link Validity',
				htmlInputType: 'text'
			}
		]
	}
];
module.exports.data = data;
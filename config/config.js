const dataStackUtils = require('@appveen/data.stack-utils');
let debugDB = false;
if (process.env.LOG_LEVEL == 'DB_DEBUG') { process.env.LOG_LEVEL = 'debug'; debugDB = true; }

let logger = global.logger;
let dataStackNS = process.env.DATA_STACK_NAMESPACE;

if (process.env.KUBERNETES_SERVICE_HOST && process.env.KUBERNETES_SERVICE_PORT) {
	dataStackUtils.kubeutil.check()
		.then(
			() => logger.info('Connection to Kubernetes APi server successful!'),
			_e => {
				logger.error('ERROR :: Unable to connect to Kubernetes API server');
				logger.log(_e.message);
			});
}

function isK8sEnv() {
	return process.env.KUBERNETES_SERVICE_HOST && process.env.KUBERNETES_SERVICE_PORT;
}

if (isK8sEnv()) {
	logger.info('*** K8s environment detected ***');
	logger.info('Image version: ' + process.env.IMAGE_TAG);
} else {
	logger.info('*** Local environment detected ***');
}

function parseBoolean(val) {
	if (typeof val === 'boolean') return val;
	else if (typeof val === 'string') {
		return val.toLowerCase() === 'true';
	} else {
		return false;
	}
}

function get(_service) {
	if (isK8sEnv()) {
		if (_service == 'ne') return `http://ne.${dataStackNS}`;
		if (_service == 'sm') return `http://sm.${dataStackNS}`;
		if (_service == 'pm') return `http://pm.${dataStackNS}`;
		if (_service == 'user') return `http://user.${dataStackNS}`;
		if (_service == 'gw') return `http://gw.${dataStackNS}`;
		if (_service == 'sec') return `http://sec.${dataStackNS}`;
		if (_service == 'pm') return `http://pm.${dataStackNS}`;
	} else {
		if (_service == 'ne') return 'http://localhost:10010';
		if (_service == 'sm') return 'http://localhost:10003';
		if (_service == 'pm') return 'http://localhost:10011';
		if (_service == 'user') return 'http://localhost:10004';
		if (_service == 'gw') return 'http://localhost:9080';
		if (_service == 'sec') return 'http://localhost:10007';
		if (_service == 'pm') return 'http://localhost:10011';
	}
}

let ldapConfig = process.env.LDAP ? JSON.parse(process.env.LDAP) : {};
let azureConfig = process.env.AZURE ? JSON.parse(process.env.AZURE) : {};

function azurePassportConfig(type) {
	return {
		identityMetadata: 'https://login.microsoftonline.com/' + azureConfig['B2C_TENANT'] + '/v2.0/.well-known/openid-configuration',
		clientID: azureConfig['CLIENT_ID'],
		responseType: 'code',
		responseMode: 'query',
		redirectUrl: (isK8sEnv() ? 'https://' : 'http://') + process.env.FQDN + 
			(type === 'login' ? '/api/a/rbac/azure/login/callback' : '/api/a/rbac/azure/userFetch/callback'),
		allowHttpForRedirectUrl: process.env.FQDN == 'localhost',
		clientSecret: azureConfig['CLIENT_SECRET'],
		validateIssuer: true,
		issuer: null,
		passReqToCallback: false,
		scope: ['profile', 'email', 'user.read'],
		useCookieInsteadOfSession: true,
		cookieEncryptionKeys: [
			{ 'key': '12345678901234567890123456789012', 'iv': '123456789012' },
			{ 'key': 'abcdefghijklmnopqrstuvwxyzabcdef', 'iv': 'abcdefghijkl' }
		],
		loggingLevel: process.env.LOG_LEVEL,
		loggingNoPII: true,
		nonceLifetime: null,
		nonceMaxAmount: 5,
		clockSkew: null,
	};
}

if (isK8sEnv() && !dataStackNS) throw new Error('DATA_STACK_NAMESPACE not found. Please check your configMap');


module.exports = {
	baseUrlSM: get('sm') + '/sm',
	baseUrlNE: get('ne') + '/ne',
	baseUrlUSR: get('user') + '/rbac',
	baseUrlPM: get('pm') + '/pm',
	debugDB: debugDB,
	validationApi: get('user') + '/rbac/validate',
	baseUrlSEC: get('sec') + '/sec',
	secret: 'u?5k167v13w5fhjhuiweuyqi67621gqwdjavnbcvadjhgqyuqagsduyqtw87e187etqiasjdbabnvczmxcnkzn',
	refreshSecret: 'iouhzsueiryozayvrhisjhtojgbaburaoganpatraoaptehjgcjgccjagaurnautbabubhaiyasdcsddscds',
	adSecret: 'jkbwejkbchalchaiyachaiyachaiyasareishqkichavchalchaiyachaiyapavjannatchalechalchaiyachaiyadsc',
	isK8sEnv: isK8sEnv,
	ldapConfig: {
		connectTimeout: parseInt(process.env.DIRECTORY_CONNECTION_TIMEOUT_MILLI) || 10000,
		recordFetchTimeLimit: parseInt(process.env.DIRECTORY_RECORD_FETCH_TIME_LIMIT) || 20
	},
	logQueueName: 'systemService',
	dataStackNS: dataStackNS,
	mongoUrlAppcenter: process.env.MONGO_APPCENTER_URL || 'mongodb://localhost',
	streamingConfig: {
		url: process.env.STREAMING_HOST || 'nats://127.0.0.1:4222',
		user: process.env.STREAMING_USER || '',
		pass: process.env.STREAMING_PASS || '',
		// maxReconnectAttempts: process.env.STREAMING_RECONN_ATTEMPTS || 500,
		// reconnectTimeWait: process.env.STREAMING_RECONN_TIMEWAIT_MILLI || 500
		maxReconnectAttempts: process.env.STREAMING_RECONN_ATTEMPTS || 500,
		connectTimeout: 2000,
		stanMaxPingOut: process.env.STREAMING_RECONN_TIMEWAIT_MILLI || 500
	},
	mongoOptions: {
		reconnectTries: process.env.MONGO_RECONN_TRIES,
		reconnectInterval: process.env.MONGO_RECONN_TIME_MILLI,
		useNewUrlParser: true,
		dbName: process.env.MONGO_AUTHOR_DBNAME || 'odpConfig'
	},
	mongoAppcenterOptions: {
		reconnectTries: process.env.MONGO_RECONN_TRIES,
		reconnectInterval: process.env.MONGO_RECONN_TIME_MILLI,
		useNewUrlParser: true
	},
	mongooseCustomLogger: (coll, op, doc, proj) => {
		process.stdout.write(`Mongoose: ${coll}.${op}(${JSON.stringify(doc)}`);
		if (proj) process.stdout.write(',' + JSON.stringify(proj) + ')\n');
		else process.stdout.write(')\n');
	},
	ldapDetails: {
		ldapServerDetails: {
			'url': ldapConfig['SERVER_URL'],
			'bindDN' : ldapConfig['BIND_DN'],
			'bindCredentials': ldapConfig['BIND_PASSWORD'],
			'searchBase' : ldapConfig['BASE_DN'],
			'searchFilter': ldapConfig['USER_ID_ATTRIBUTE'] ? `(${ldapConfig['USER_ID_ATTRIBUTE']}={{username}})` : '(cn={{username}})',
		},
		mapping: {
			username: ldapConfig['USER_ID_ATTRIBUTE'] ? ldapConfig['USER_ID_ATTRIBUTE'] : 'cn',
			name: ldapConfig['USER_NAME_ATTRIBUTE'] ? ldapConfig['USER_NAME_ATTRIBUTE'] : 'sn',
			email: ldapConfig['USER_EMAIL_ATTRIBUTE'] ? ldapConfig['USER_EMAIL_ATTRIBUTE'] : 'mail'
		},
		baseFilter: ldapConfig['BASE_FILTER']
	},
	azurePassportConfig: azurePassportConfig,
	azureConfig: {
		clientId: azureConfig['CLIENT_ID'],
		clientSecret: azureConfig['CLIENT_SECRET'],
		b2cTenant: azureConfig['B2C_TENANT'],
		adUserAttribute: azureConfig['AD_USER_ATTRIBUTE'] ? azureConfig['AD_USER_ATTRIBUTE'] : 'mail'
	},
	RBAC_USER_AUTH_MODES: process.env.RBAC_USER_AUTH_MODES ? (process.env.RBAC_USER_AUTH_MODES).split(',') : ['local'],
	RBAC_USER_TOKEN_DURATION: parseInt(process.env.RBAC_USER_TOKEN_DURATION || 1800),
	RBAC_USER_TOKEN_REFRESH: process.env.RBAC_USER_TOKEN_REFRESH ? parseBoolean(process.env.RBAC_USER_TOKEN_REFRESH) : true,
	RBAC_USER_TO_SINGLE_SESSION: parseBoolean(process.env.RBAC_USER_TO_SINGLE_SESSION || false),
	RBAC_USER_CLOSE_WINDOW_TO_LOGOUT: parseBoolean(process.env.RBAC_USER_CLOSE_WINDOW_TO_LOGOUT || false),
	RBAC_BOT_TOKEN_DURATION: parseInt(process.env.RBAC_BOT_TOKEN_DURATION || 1800),
	RBAC_HB_INTERVAL: parseInt(process.env.RBAC_HB_INTERVAL || 50),
	RBAC_USER_RELOGIN_ACTION: process.env.RBAC_USER_RELOGIN_ACTION ? process.env.RBAC_USER_RELOGIN_ACTION.toLowerCase() : 'allow',
	PRIVATE_FILTER: process.env.SAVE_FILTER_DEFAULT_MODE_PRIVATE ? parseBoolean(process.env.SAVE_FILTER_DEFAULT_MODE_PRIVATE) : true,
	GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
	DS_FUZZY_SEARCH: parseBoolean(process.env.DS_FUZZY_SEARCH || false),
	B2B_AGENT_MAX_FILE_SIZE: process.env.B2B_AGENT_MAX_FILE_SIZE || '100m',
	B2B_FLOW_REJECT_ZONE_ACTION: process.env.B2B_FLOW_REJECT_ZONE_ACTION || 'queue',
	B2B_FLOW_MAX_CONCURRENT_FILES: parseInt(process.env.B2B_FLOW_MAX_CONCURRENT_FILES || '0'),
	B2B_ENABLE_TIMEBOUND: parseBoolean(process.env.B2B_ENABLE_TIMEBOUND),
	B2B_ENABLE_TRUSTED_IP: parseBoolean(process.env.B2B_ENABLE_TRUSTED_IP),
	VERIFY_DEPLOYMENT_USER: parseBoolean(process.env.VERIFY_DEPLOYMENT_USER)
};
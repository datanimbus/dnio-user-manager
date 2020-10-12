const odpUtils = require('@appveen/odp-utils');
let debugDB = false;
if (process.env.LOG_LEVEL == 'DB_DEBUG') { process.env.LOG_LEVEL = 'debug'; debugDB = true; }

let logger = global.logger;
let odpNS = process.env.ODP_NAMESPACE;

if (process.env.KUBERNETES_SERVICE_HOST && process.env.KUBERNETES_SERVICE_PORT && process.env.ODPENV == 'K8s') {
	odpUtils.kubeutil.check()
		.then(
			() => logger.info('Connection to Kubernetes APi server successful!'),
			_e => {
				logger.error('ERROR :: Unable to connect to Kubernetes API server');
				logger.log(_e.message);
			});
}

function isK8sEnv() {
	return process.env.KUBERNETES_SERVICE_HOST && process.env.KUBERNETES_SERVICE_PORT && process.env.ODPENV == 'K8s';
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
		if (_service == 'ne') return `http://ne.${odpNS}`;
		if (_service == 'sm') return `http://sm.${odpNS}`;
		if (_service == 'pm') return `http://pm.${odpNS}`;
		if (_service == 'user') return `http://user.${odpNS}`;
		if (_service == 'gw') return `http://gw.${odpNS}`;
		if (_service == 'sec') return `http://sec.${odpNS}`;
		if (_service == 'pm') return `http://pm.${odpNS}`;
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

function ldapConfig() {
	return {
		connectTimeout: parseInt(process.env.DIRECTORY_CONNECTION_TIMEOUT) || 10000,
		recordFetchTimeLimit: parseInt(process.env.DIRECTORY_RECORD_FETCH_TIME_LIMIT) || 20
	};
}

function azurePassportConfig(type) {
	return {
		identityMetadata: 'https://login.microsoftonline.com/' + process.env.AZURE_B2C_TENANT + '/v2.0/.well-known/openid-configuration',
		clientID: process.env.AZURE_CLIENTID,
		responseType: 'code',
		responseMode: 'query',
		redirectUrl: (isK8sEnv() ? 'https://' : 'http://') + process.env.FQDN + 
			(type === 'login' ? '/api/a/rbac/azure/login/callback' : '/api/a/rbac/azure/userFetch/callback'),
		allowHttpForRedirectUrl: true,
		clientSecret: process.env.AZURE_CLIENT_SECRET,
		validateIssuer: false,
		issuer: null,
		passReqToCallback: false,
		scope: ['profile', 'email'],
		useCookieInsteadOfSession: true,
		cookieEncryptionKeys: [
			{ 'key': '12345678901234567890123456789012', 'iv': '123456789012' },
			{ 'key': 'abcdefghijklmnopqrstuvwxyzabcdef', 'iv': 'abcdefghijkl' }
		],
		loggingLevel: 'debug',
		loggingNoPII: true,
		nonceLifetime: null,
		nonceMaxAmount: 5,
		clockSkew: null,
	};
}

if (isK8sEnv() && !odpNS) throw new Error('ODP_NAMESPACE not found. Please check your configMap');


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
	ldapConfig: ldapConfig(),
	logQueueName: 'systemService',
	odpNS: odpNS,
	mongoUrlAppcenter: process.env.MONGO_APPCENTER_URL || 'mongodb://localhost',
	NATSConfig: {
		url: process.env.NATS_HOST || 'nats://127.0.0.1:4222',
		user: process.env.NATS_USER || '',
		pass: process.env.NATS_PASS || '',
		// maxReconnectAttempts: process.env.NATS_RECONN_ATTEMPTS || 500,
		// reconnectTimeWait: process.env.NATS_RECONN_TIMEWAIT || 500
		maxReconnectAttempts: process.env.NATS_RECONN_ATTEMPTS || 500,
		connectTimeout: 2000,
		stanMaxPingOut: process.env.NATS_RECONN_TIMEWAIT || 500
	},
	mongoOptions: {
		reconnectTries: process.env.MONGO_RECONN_TRIES,
		reconnectInterval: process.env.MONGO_RECONN_TIME,
		useNewUrlParser: true,
		dbName: process.env.MONGO_AUTHOR_DBNAME || 'odpConfig'
	},
	mongoAppcenterOptions: {
		reconnectTries: process.env.MONGO_RECONN_TRIES,
		reconnectInterval: process.env.MONGO_RECONN_TIME,
		useUnifiedTopology: true,
		useNewUrlParser: true
	},
	mongooseCustomLogger: (coll, op, doc, proj) => {
		process.stdout.write(`Mongoose: ${coll}.${op}(${JSON.stringify(doc)}`);
		if (proj) process.stdout.write(',' + JSON.stringify(proj) + ')\n');
		else process.stdout.write(')\n');
	},
	ldapServerDetails: {
		'url': process.env.LDAP_SERVER_URL,
		'bindDN' : process.env.LDAP_BIND_DN,
		'bindCredentials': process.env.LDAP_BIND_PASSWORD,
		'searchBase' : process.env.LDAP_SEARCH_BASE,
		'searchFilter': '(cn={{username}})',
	},
	azurePassportConfig: azurePassportConfig,
	azureAdUserAttribute: process.env.AZURE_AD_USER_ATTRIBUTE || 'mail',
	RBAC_USER_AUTH_MODES: process.env.RBAC_USER_AUTH_MODES ? (process.env.RBAC_USER_AUTH_MODES).split(',') : 'local',
	RBAC_USER_TOKEN_DURATION: parseInt(process.env.RBAC_USER_TOKEN_DURATION || 30),
	RBAC_USER_TOKEN_REFRESH: process.env.RBAC_USER_TOKEN_REFRESH ? parseBoolean(process.env.RBAC_USER_TOKEN_REFRESH) : true,
	RBAC_USER_TO_SINGLE_SESSION: parseBoolean(process.env.RBAC_USER_TO_SINGLE_SESSION || false),
	RBAC_USER_CLOSE_WINDOW_TO_LOGOUT: parseBoolean(process.env.RBAC_USER_CLOSE_WINDOW_TO_LOGOUT || false),
	RBAC_BOT_TOKEN_DURATION: parseInt(process.env.RBAC_BOT_TOKEN_DURATION || 30),
	RBAC_HB_INTERVAL: parseInt(process.env.RBAC_HB_INTERVAL || 50),
	RBAC_USER_RELOGIN_ACTION: process.env.RBAC_USER_RELOGIN_ACTION ? process.env.RBAC_USER_RELOGIN_ACTION.toLowerCase() : 'allow',
	PRIVATE_FILTER: process.env.SAVE_FILTER_DEFAULT_MODE_PRIVATE ? parseBoolean(process.env.SAVE_FILTER_DEFAULT_MODE_PRIVATE) : true,
	GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
	DS_FUZZY_SEARCH: parseBoolean(process.env.DS_FUZZY_SEARCH || false),
	B2B_AGENT_MAX_FILE_SIZE: process.env.B2B_AGENT_MAX_FILE_SIZE || '100m',
	B2B_FLOW_REJECT_ZONE_ACTION: process.env.B2B_FLOW_REJECT_ZONE_ACTION || 'queue',
	B2B_FLOW_MAX_CONCURRENT_FILES: parseInt(process.env.B2B_FLOW_MAX_CONCURRENT_FILES || '0'),
	B2B_ENABLE_TIMEBOUND: parseBoolean(process.env.B2B_ENABLE_TIMEBOUND),
	B2B_ENABLE_TRUSTED_IP: parseBoolean(process.env.B2B_ENABLE_TRUSTED_IP)
};
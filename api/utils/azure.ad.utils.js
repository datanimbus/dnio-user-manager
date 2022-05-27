const msal = require('@azure/msal-node');
const MicrosoftGraph = require('@microsoft/microsoft-graph-client');
const JWT = require('jsonwebtoken');


const logger = global.logger;
const config = require('../../config/config');
const azureConfig = config.azureConfig;
const SECRET = config.secret;

let authorityHostUrl = 'https://login.microsoftonline.com';
let tenant = azureConfig.b2cTenant;
let authorityUrl = authorityHostUrl + '/' + tenant;
let applicationId = azureConfig.clientId;
let clientSecret = azureConfig.clientSecret;
let msalClient;
if (tenant && clientSecret && applicationId) {
	msalClient = new msal.ConfidentialClientApplication({
		auth: {
			clientId: applicationId,
			authority: authorityUrl,
			clientSecret: clientSecret
		}
	});
}


async function getAuthUrl(state) {
	try {
		const url = await msalClient.getAuthCodeUrl({
			scopes: config.azurePassportConfig('login').scope,
			redirectUri: config.azurePassportConfig('login').redirectUrl,
			responseMode: msal.ResponseMode.QUERY,
			state: state ? state : 'login'
		});
		return url;
	} catch (err) {
		logger.error('Error in validateAzureCredentials :: ', err);
		throw err;
	}
}

async function getAccessTokenByCode(code) {
	try {
		const response = await msalClient.acquireTokenByCode({
			scopes: config.azurePassportConfig('login').scope,
			redirectUri: config.azurePassportConfig('login').redirectUrl,
			code: code
		});
		return response;
	} catch (err) {
		logger.error('Error in validateAzureCredentials :: ', err);
		throw err;
	}
}

async function getCurrentUserInfo(accessToken) {
	try {
		let userAttribute = config.azureConfig.adUserAttribute;
		logger.debug('AD user attribute name :: ', userAttribute);
		let client = MicrosoftGraph.Client.init({
			authProvider: (done) => {
				done(null, accessToken);
			}
		});
		let userInfo = await client.api('/me').get();
		logger.trace('Azure user info result :: ', userInfo);
		return {
			username: userInfo[userAttribute],
			name: userInfo.displayName,
			email: userInfo.mail,
			phone: userInfo.mobilePhone
		};
	} catch (error) {
		logger.error('Azure User Info API Failed :: ', error);
		throw error;
	}
}

async function getUserInfo(searchText, accessToken) {
	try {
		let userAttribute = config.azureConfig.adUserAttribute;
		logger.debug('AD user attribute name :: ', userAttribute);
		let client = MicrosoftGraph.Client.init({
			authProvider: (done) => {
				done(null, accessToken);
			}
		});
		let userInfo = await client.api('/users').filter(`startswith(displayName,'${searchText}') or startswith(userPrincipalName,'${searchText}')`).top(1).get();
		logger.trace('Azure user info result :: ', userInfo);
		if (Array.isArray(userInfo)) {
			if (userInfo.length === 0) {
				return null;
			}
			return {
				username: userInfo[0][userAttribute],
				name: userInfo[0].displayName,
				email: userInfo[0].mail,
				phone: userInfo[0].mobilePhone
			};
		}
		if (!userInfo) {
			return null;
		}
		return {
			username: userInfo[userAttribute],
			name: userInfo.displayName,
			email: userInfo.mail,
			phone: userInfo.mobilePhone
		};
	} catch (error) {
		logger.error('Azure User Info API Failed :: ', error);
		throw error;
	}
}

function storeInJWT(req, azureToken) {
	return JWT.sign({ azureToken: azureToken, userId: req.user._id }, SECRET);
}

function fetchFromJWT(req) {
	try {
		const data = JWT.verify(req.cookie['azure-token'], SECRET);
		if (data.userId != req.user._id) {
			throw new Error('Invalid Azure Token');
		}
		return data.azureToken;
	} catch (err) {
		logger.error(err);
		throw new Error('Invalid Azure Token');
	}
}

module.exports.getAuthUrl = getAuthUrl;
module.exports.getUserInfo = getUserInfo;
module.exports.getCurrentUserInfo = getCurrentUserInfo;
module.exports.getAccessTokenByCode = getAccessTokenByCode;
module.exports.storeInJWT = storeInJWT;
module.exports.fetchFromJWT = fetchFromJWT;
const crypto = require('crypto');
let AuthenticationContext = require('adal-node').AuthenticationContext;
const MicrosoftGraph = require('@microsoft/microsoft-graph-client');

const logger = global.logger;
let envConfig = require('../../../config/config');
let e = {};

const algorithm = 'aes256';

e.encrypt = function (text) {
	let cipher = crypto.createCipher(algorithm, envConfig.adSecret);
	const encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
	return encrypted;
};

e.decrypt = function (text) {
	const decipher = crypto.createDecipher(algorithm, envConfig.adSecret);
	const decrypted = decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
	return decrypted;
};

// e.requestAccessCode = function (authCode, type) {
// 	let fqdn = process.env.FQDN || 'localhost';
// 	let protocol = envConfig.isK8sEnv() ? 'https' : 'http';
// 	let redirectUri = `${protocol}://${fqdn}/api/a/rbac/callback/azure/${type}`;
// 	return mongoose.model('config').findOne({ 'configType': 'auth', 'auth.class': 'AD', 'auth.mode': 'azure' })
// 		.then(_conf => {
// 			if (_conf) {
// 				let options = {
// 					url: `https://login.microsoftonline.com/${_conf.auth.connectionDetails.tenant}/oauth2/v2.0/token`,
// 					method: 'POST',
// 					form: {
// 						'client_id': _conf.auth.connectionDetails.clientId,
// 						'scope': 'user.read',
// 						'code': authCode,
// 						'redirect_uri': redirectUri,
// 						'grant_type': 'authorization_code',
// 						'client_secret': _conf.auth.connectionDetails.clientSecret
// 					},
// 					json: true
// 				};
// 				logger.debug(options);
// 				return new Promise((resolve, reject) => {
// 					request.post(options, function (err, res, body) {
// 						if (err) reject(err);
// 						else if (res.statusCode >= 200 && res.statusCode < 400) {
// 							resolve(body.access_token);
// 						} else {
// 							logger.error('Error fetching Access Token');
// 							logger.error(body);
// 							reject(new Error(body.message));
// 						}
// 					});
// 				});
// 			} else {
// 				throw new Error('AzureAD config not found');
// 			}
// 		});
// };

e.validateAzureCredentials = function (azureConfig) {
	let authorityHostUrl = 'https://login.microsoftonline.com';
	let tenant = azureConfig.b2cTenant;
	let authorityUrl = authorityHostUrl + '/' + tenant;
	let applicationId = azureConfig.clientId;
	let clientSecret = azureConfig.clientSecret;
	if(!tenant) return Promise.reject('Missing AZURE.B2C_TENANT.');
	if(!applicationId) return Promise.reject('Missing AZURE.CLIENT_ID.');
	if(!clientSecret) return Promise.reject('Missing AZURE.CLIENT_SECRET.');
	let resource = '00000002-0000-0000-c000-000000000000'; // URI that identifies the resource for which the token is valid.
	let context = new AuthenticationContext(authorityUrl);
	return new Promise((resolve, reject) => {
		logger.debug({ resource, applicationId });
		context.acquireTokenWithClientCredentials(resource, applicationId, clientSecret, function (err, tokenResponse) {
			if (err) {
				logger.error('Error in validateAzureCredentials :: ', err);
				reject(err);
			} else {
				logger.debug('Validated Azure Credentials.');
				resolve(tokenResponse);
			}
		});
	});
};

// e.searchUser = function (accessToken, filter) {
// 	return new Promise((resolve, reject) => {
// 		let userAttribute = envConfig.azureConfig.adUserAttribute;
// 		logger.debug('AD user attribute name :: ', userAttribute);
// 		let client = MicrosoftGraph.Client.init({
// 			authProvider: (done) => {
// 				done(null, accessToken); //first parameter takes an error if you can't get an access token
// 			}
// 		});
// 		let userApi;
// 		if(filter)
// 			userApi = client.api('/users').filter(filter);
// 		else
// 			userApi = client.api('/users').top(2);
// 		userApi.get((err, result) => {
// 			if (err) {
// 				let errMsg = 'Azure User Search API Failed';
// 				logger.error('Azure User Search API Failed :: ', err);
// 				if (err.message) errMsg = err.message;
// 				else {
// 					try {
// 						let errBody = JSON.parse(err.body);
// 						errMsg = errBody.error && errBody.error.message ? errBody.error.message : errMsg;
// 					} catch (err) {
// 						logger.error('Error in parsing erorr');
// 					}
// 				}
// 				reject(new Error(errMsg));
// 			}
// 			if (result.value) {
// 				logger.debug('Azure user search result :: ', result.value);
// 				let usersList = result.value.filter(_r => _r[userAttribute]).map(_r => {
// 					return {
// 						username: _r[userAttribute],
// 						name: _r.displayName,
// 						email: _r.mail
// 					};
// 				});
// 				resolve(usersList);
// 			} else {
// 				logger.debug('No Users found with filter :: ', filter);
// 				resolve([]);
// 			}
// 		});
// 	});
// };

e.getADUserInfo = function (accessToken) {
	let userAttribute = envConfig.azureConfig.adUserAttribute;
	logger.debug('AD user attribute name :: ', userAttribute);
	return new Promise(async (resolve, reject) => {
		let client = MicrosoftGraph.Client.init({
			authProvider: (done) => {
				done(null, accessToken); //first parameter takes an error if you can't get an access token
			}
		});
		try {
			let userInfo = await client.api('/me').get();
			logger.trace('Azure user info result :: ', userInfo);
			resolve({
				username: userInfo[userAttribute],
				name: userInfo.displayName,
				email: userInfo.mail,
				phone: userInfo.mobilePhone 
			});

		} catch(error) {
			logger.error('Azure User Info API Failed :: ', error);
			reject(error);
		}
	});
};

module.exports = e;
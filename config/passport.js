var LocalStrategy = require('passport-local').Strategy;
var LdapStrategy = require('passport-ldapauth');
// var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
// var AzureAdOAuth2Strategy = require('passport-azure-ad-oauth2');
var config = require('./config');
var { validateLocalLogin, validateLdapLogin } = require('./../api/controllers/user.controller');

let logger = global.logger;

module.exports = function (passport) {
	passport.use(new LocalStrategy(validateLocalLogin));

	if (config.RBAC_USER_AUTH_MODES.includes('ldap')) {
		let serverDetails = config.ldapDetails();
		if (logger) {
			logger.debug('LDAP Server Details:', JSON.stringify(serverDetails));
		} else {
			console.log('LDAP Server Details:', JSON.stringify(serverDetails));
		}
		passport.use(new LdapStrategy({ server: serverDetails.serverDetails }, validateLdapLogin));
	}

	// if (config.RBAC_USER_AUTH_MODES.includes('azure')) {
	// 	passport.use('AzureLogIn', new OIDCStrategy(config.azurePassportConfig('login'), validateAzureLogin));
	// }
};
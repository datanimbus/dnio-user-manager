const userActivities = {
	'USER_ADDED': 'USER',
	'BOT_ADDED': 'USER',
	'USER_REMOVED': 'USER',
	'BOT_REMOVED': 'USER',
	'APP_USER_ADDED': 'USER',
	'APP_BOT_ADDED': 'USER',
	'APP_USER_REMOVED': 'USER',
	'APP_BOT_REMOVED': 'USER',
	'USER_LOGIN': 'ACCESS',
	'BOT_LOGIN': 'ACCESS',
	'USER_LOGOUT': 'ACCESS',
	'BOT_LOGOUT': 'ACCESS',
	'USER_LOGIN_FAILED': 'ACCESS',
	'BOT_LOGIN_FAILED': 'ACCESS',
	'USER_TOKEN_REFRESH': 'ACCESS',
	'BOT_TOKEN_REFRESH': 'ACCESS',
	'APP_ADMIN_GRANT': 'ADMIN',
	'APP_ADMIN_REVOKE': 'ADMIN',
	'SUPER_ADMIN_GRANT': 'ADMIN',
	'SUPER_ADMIN_REVOKE': 'ADMIN',
	'USER_DETAILS_UPDATE': 'DETAILS',
	'BOT_DETAILS_UPDATE': 'DETAILS',
	'USER_PASSWORD_CHANGE': 'DETAILS',
	'USER_PASSWORD_RESET': 'DETAILS',
	'BOT_PASSWORD_RESET': 'DETAILS',
	'GROUP_USER_ADDED': 'GROUP',
	'GROUP_BOT_ADDED': 'GROUP',
	'GROUP_USER_REMOVED': 'GROUP',
	'GROUP_BOT_REMOVED': 'GROUP',
};

module.exports = { userActivities };
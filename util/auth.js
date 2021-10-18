const router = require('express').Router();
const { AuthCacheMW } = require('@appveen/ds-auth-cache');
const config = require('../config/config');

// const logger = global.logger;

const permittedUrls = [
	'/rbac/login',
	'/rbac/ldap/login',
	'/rbac/azure/login',
	'/rbac/azure/login/callback',
	'/rbac/azure/userFetch/callback',
	'/rbac/closeAllSessions',
	'/rbac/authType/{userName}'
];

router.use(AuthCacheMW({ permittedUrls, secret: config.TOKEN_SECRET, decodeOnly: true }));

router.use((req, res, next) => {
	if (!req.locals) {
		req.locals = {};
	}
	if (req.params.app) {
		req.locals.app = req.params.app;
	} else if (req.query.app) {
		req.locals.app = req.query.app;
	} else if (req.query.filter) {
		let filter = req.query.filter;
		if (typeof filter === 'string') {
			filter = JSON.parse(filter);
		}
		req.locals.app = filter.app;
	} else if (req.body.app) {
		req.locals.app = req.body.app;
	}
	// check if user is app admin or super admin
	if (req.user && (req.user.isSuperAdmin || (req.user.apps && req.user.apps.indexOf(req.locals.app) > -1))) {
		req.locals.skipPermissionCheck = true;
	}
	next();
});

module.exports = router;
const router = require('express').Router();
const { AuthCacheMW } = require('@appveen/ds-auth-cache');
const JWT = require('jsonwebtoken');
const _ = require('lodash');
const config = require('../config/config');

const logger = global.logger;
global.USER_TOKEN = JWT.sign({ name: 'USER', _id: 'admin', isSuperAdmin: true }, config.TOKEN_SECRET);

const permittedUrls = [
	'/rbac/auth/authType/{id}',
	'/rbac/auth/login',
	'/rbac/auth/azure/login/callback',
	'/rbac/auth/azure/login',
	'/rbac/auth/ldap/login',
	'/rbac/auth/authType/{id}',
	'/rbac/internal/health/live',
	'/rbac/internal/health/ready'
];

const onlyAuthUrls = [
	'/rbac/data/app',
	'/rbac/data/app/{id}',
	'/rbac/data/{id}/allRoles',
	'/rbac/data/{id}/appList',
	'/rbac/data/preferences',
	'/rbac/data/preferences/{id}',
	'/rbac/data/filter',
	'/rbac/data/filter/{id}',
	'/rbac/auth/logout',
	'/rbac/auth/change-password',
	'/rbac/auth/validate',
	'/rbac/auth/check',
	'/rbac/auth/extend',
	'/rbac/auth/refresh',
	'/rbac/auth/hb',
];

const internalUrls = [
	'/rbac/{app}/keys',
];

const adminOnlyUrls = [
	'/rbac/{app}/app/{id}',
	'/rbac/{app}/app',
	'/rbac/{app}/app/ipwhitelisting',
];

const superAdminOnlyUrls = [
	'/rbac/admin/app',
	'/rbac/admin/app/{id}',
	'/rbac/admin/user',
	'/rbac/admin/user/utils/count',
	'/rbac/admin/user/{id}',
	'/rbac/admin/user/{id}/superAdmin/{action}',
	'/rbac/admin/group/count',
	'/rbac/admin/group',
	'/rbac/admin/group/{id}'
];

const commonUrls = [
	'/rbac/{app}/user',
	'/rbac/{app}/user/utils/count',
	'/rbac/{app}/user/{id}',
	'/rbac/{app}/user/utils/bulkCreate/template',
	'/rbac/{app}/user/utils/bulkCreate/upload',
	'/rbac/{app}/user/utils/bulkCreate/fileTransfers',
	'/rbac/{app}/user/utils/bulkCreate/{fileId}/count',
	'/rbac/{app}/user/utils/bulkCreate/{fileId}/userList',
	'/rbac/{app}/user/utils/distinctAttributes/{id}',
	'/rbac/{app}/user/utils/closeAllSessions/{id}',
	'/rbac/{app}/user/utils/appAdmin/{id}/{action}',
	'/rbac/{app}/user/utils/reset/{id}',
	'/rbac/{app}/user/utils/addToGroups/{id}',
	'/rbac/{app}/user/utils/removeFromGroups/{id}',
	'/rbac/{app}/user/utils/addToApps/{id}',
	'/rbac/{app}/user/utils/import/{id}',
	'/rbac/{app}/user/utils/removeUsers',
	'/rbac/{app}/user/utils/removeBots',
	'/rbac/{app}/{userType}/utils/status/{id}/{userState}',
	'/rbac/{app}/bot',
	'/rbac/{app}/bot/utils/count',
	'/rbac/{app}/bot/{id}',
	'/rbac/{app}/bot/utils/botKey/{id}',
	'/rbac/{app}/bot/utils/botKey/session/{id}',
	'/rbac/{app}/group/count',
	'/rbac/{app}/group',
	'/rbac/{app}/group/{id}',
	'/rbac/{app}/group/{id}/{usrType}/count',
	'/rbac/{app}/group/{id}/{usrType}',
	'/rbac/{app}/bookmark/utils/count',
	'/rbac/{app}/bookmark',
	'/rbac/{app}/bookmark/utils/bulkDelete',
	'/rbac/{app}/bookmark/{id}',
	'/rbac/{app}/user/utils/azure/token/new',
	'/rbac/{app}/user/utils/azure/token',
	'/rbac/{app}/user/utils/azure/search',
	'/rbac/{app}/user/utils/azure/import',
];

router.use(AuthCacheMW({ permittedUrls: _.concat(permittedUrls, internalUrls), secret: config.TOKEN_SECRET, decodeOnly: true }));

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
	const matchingPath = commonUrls.find(e => compareURL(e, req.path));
	if (!req.locals.app && matchingPath) {
		const params = getUrlParams(matchingPath, req.path);
		if (params && params['{app}']) req.locals.app = params['{app}'];
	}

	// Check if user is an app admin or super admin.
	if (req.user) {
		if (req.locals.app) {
			const temp = (req.user.allPermissions || []).find(e => e.app === req.locals.app);
			req.user.appPermissions = temp ? temp.permissions : [];
		} else {
			req.user.appPermissions = [];
		}
		if (req.user.isSuperAdmin || (req.user.apps && req.user.apps.indexOf(req.locals.app) > -1)) {
			req.locals.skipPermissionCheck = true;
		}
	}
	next();
});

router.use((req, res, next) => {

	// Check if path required only authentication checks.
	if (_.concat(onlyAuthUrls, permittedUrls).some(e => compareURL(e, req.path))) {
		return next();
	}

	// Check if path is for internal Use.
	if (internalUrls.some(e => compareURL(e, req.path))) {
		// Some Auth check for internal URLs required.
		req.locals.skipPermissionCheck = true;
		return next();
	}

	// Check if path is allowed only to super admins.
	if (superAdminOnlyUrls.some(e => compareURL(e, req.path)) && req.user && req.user.isSuperAdmin) {
		return next();
	}

	// Check if path is allowed only to admins and super admins.
	if (adminOnlyUrls.some(e => compareURL(e, req.path)) && req.locals.skipPermissionCheck) {
		return next();
	}

	// All these paths required permissions check.
	if (commonUrls.some(e => compareURL(e, req.path))) {
		// Pass if user is admin or super admin.
		if (req.locals.skipPermissionCheck) {
			return next();
		}

		if (!req.locals.app) {
			return res.status(400).json({ message: 'App value needed for this API' });
		}

		// Check if user has permission for the path.
		if (canAccessPath(req)) {
			return next();
		}
	}
	return res.status(403).json({ message: 'You don\'t have access for this API' });
});


function compareURL(tempUrl, url) {
	let tempUrlSegment = tempUrl.split('/').filter(_d => _d != '');
	let urlSegment = url.split('/').filter(_d => _d != '');
	if (tempUrlSegment.length != urlSegment.length) return false;

	tempUrlSegment.shift();
	urlSegment.shift();

	let flag = tempUrlSegment.every((_k, i) => {
		if (_k.startsWith('{') && _k.endsWith('}') && urlSegment[i] != '') return true;
		return _k === urlSegment[i];
	});
	logger.trace(`Compare URL :: ${tempUrl}, ${url} :: ${flag}`);
	return flag;
}

function getUrlParams(tempUrl, url) {
	const values = {};
	let tempUrlSegment = tempUrl.split('/').filter(_d => _d != '');
	let urlSegment = url.split('/').filter(_d => _d != '');
	tempUrlSegment.shift();
	urlSegment.shift();
	tempUrlSegment.forEach((_k, i) => {
		if (_k.startsWith('{') && _k.endsWith('}') && urlSegment[i] != '') {
			values[_k] = urlSegment[i];
		}
	});
	logger.trace(`Params Map :: ${values}`);
	return values;
}

function canAccessPath(req) {
	if (compareURL('/rbac/{app}/user', req.path) && _.intersectionWith(req.user.appPermissions, ['PMU', 'PVU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/user/utils/bulkCreate/template', req.path) && _.intersectionWith(req.user.appPermissions, ['PMU', 'PVU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/user/utils/bulkCreate/upload', req.path) && _.intersectionWith(req.user.appPermissions, ['PMU', 'PVU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/user/utils/bulkCreate/fileTransfers', req.path) && _.intersectionWith(req.user.appPermissions, ['PMU', 'PVU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/user/utils/bulkCreate/{fileId}/count', req.path) && _.intersectionWith(req.user.appPermissions, ['PMU', 'PVU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/user/utils/bulkCreate/{fileId}/userList', req.path) && _.intersectionWith(req.user.appPermissions, ['PMU', 'PVU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/user/utils/count', req.path) && _.intersectionWith(req.user.appPermissions, ['PMU', 'PVU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/user/utils/create', req.path) && _.intersection(req.user.appPermissions, ['PMUBC']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/user/utils/distinctAttributes', req.path) && _.intersectionWith(req.user.appPermissions, ['PMU', 'PVU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/user/utils/import/{id}', req.path) && _.intersection(req.user.appPermissions, ['PMUBC']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/user/utils/removeUsers', req.path) && _.intersectionWith(req.user.appPermissions, ['PMU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/user/utils/removeBots', req.path) && _.intersectionWith(req.user.appPermissions, ['PMB'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/user/utils/closeAllSessions/{id}', req.path) && _.intersection(req.user.appPermissions, ['PMUA']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/user/utils/azure/token/new', req.path) && _.intersectionWith(req.user.appPermissions, ['PMU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/user/utils/azure/token', req.path) && _.intersectionWith(req.user.appPermissions, ['PMU', 'PVU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/user/utils/azure/search', req.path) && _.intersectionWith(req.user.appPermissions, ['PMU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/user/utils/azure/import', req.path) && _.intersectionWith(req.user.appPermissions, ['PMU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/user/{id}', req.path) && _.intersectionWith(req.user.appPermissions, ['PMU', 'PVU', 'PMB', 'PVB'], comparator).length > 0) {
		if (req.method === 'PUT' || req.method === 'POST' || req.method === 'DELETE') {
			if (_.intersectionWith(req.user.appPermissions, ['PMU', 'PMB'], comparator).length > 0) {
				return true;
			}
			return false;
		}
		return true;
	}
	if (compareURL('/rbac/{app}/user/utils/reset/{id}', req.path) && _.intersection(req.user.appPermissions, ['PMUBU']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/user/utils/appAdmin/{id}/{action}', req.path) && _.intersection(req.user.appPermissions, ['PMUBU']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/user/utils/addToGroups/{id}', req.path) && _.intersection(req.user.appPermissions, ['PMUG']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/user/utils/removeFromGroups/{id}', req.path) && _.intersection(req.user.appPermissions, ['PMUG']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/bot', req.path) && _.intersectionWith(req.user.appPermissions, ['PMB', 'PVB'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/bot/{id}', req.path) && _.intersectionWith(req.user.appPermissions, ['PMB'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/bot/utils/count', req.path) && _.intersectionWith(req.user.appPermissions, ['PMB', 'PVB'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/bot/utils/botKey/{id}', req.path) && _.intersection(req.user.appPermissions, ['PMBA']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/bot/utils/botKey/session/{id}', req.path) && _.intersection(req.user.appPermissions, ['PMBA']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/{userType}/utils/status/{id}/{userState}', req.path) && _.intersection(req.user.appPermissions, ['PMUBU', 'PMBBU']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/group/{usrType}/{groupId}/count', req.path) && _.intersection(req.user.appPermissions, ['PMUG']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{usrType}/app/{app}/{groupId}', req.path) && _.intersection(req.user.appPermissions, ['PMUG']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/group/utils/count', req.path) && _.intersectionWith(req.user.appPermissions, ['PMG', 'PVG'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/group', req.path) && _.intersectionWith(req.user.appPermissions, ['PMG', 'PVG'], comparator).length > 0) {
		if ((req.method === 'POST')) {
			if (_.intersectionWith(req.user.appPermissions, ['PMG'], comparator).length > 0) {
				return true;
			} else {
				return false;
			}
		}
		return true;
	}
	if (compareURL('/rbac/{app}/group/{id}', req.path) && _.intersectionWith(req.user.appPermissions, ['PMG', 'PVG'], comparator).length > 0) {
		if ((req.method === 'PUT' || req.method === 'DELETE')) {
			if (_.intersectionWith(req.user.appPermissions, ['PMG'], comparator).length > 0) {
				return true;
			} else {
				return false;
			}
		}
		return true;
	}
	if (compareURL('/rbac/{app}/group/{id}/{usrType}/count', req.path) && _.intersectionWith(req.user.appPermissions, ['PMG', 'PVG'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/group/{id}/{usrType}', req.path) && _.intersectionWith(req.user.appPermissions, ['PMG', 'PVG'], comparator).length > 0) {
		return true;
	}
	return false;
}

function comparator(main, pattern) {
	return main.startsWith(pattern);
}

module.exports = router;
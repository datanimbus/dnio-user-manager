const router = require('express').Router();
const { AuthCacheMW } = require('@appveen/ds-auth-cache');
const JWT = require('jsonwebtoken');
const _ = require('lodash');
const config = require('../config/config');

const logger = global.logger;
global.USER_TOKEN = JWT.sign({ name: 'USER', _id: 'admin', isSuperAdmin: true }, config.TOKEN_SECRET);

const permittedUrls = [
	'/rbac/login',
	'/rbac/ldap/login',
	'/rbac/azure/login',
	'/rbac/azure/login/callback',
	'/rbac/azure/userFetch/callback',
	'/rbac/authType/{userName}',
	'/rbac/health/live',
	'/rbac/health/ready'
];

const onlyAuthUrls = [
	'/rbac/usr/app/{app}/{userId}',
	'/rbac/usr/{id}/allRoles',
	'/rbac/usr/hb',
	'/rbac/filter',
	'/rbac/filter/{id}',
	'/rbac/preferences',
	'/rbac/preferences/{id}',
	'/rbac/preferences/audit',
	'/rbac/preferences/audit/count',
	'/rbac/logout',
	'/rbac/validate',
	'/rbac/check',
	'/rbac/extend',
	'/rbac/refresh',
	'/rbac/usr/reviewpermissionservice/{entity}',
];

const internalUrls = [
	'/rbac/service/{id}',
	'/rbac/library/{id}',
	'/rbac/partner/{id}',
	'/rbac/flow/{id}',
	'/rbac/nanoservice/{id}',
	'/rbac/dataformat/{id}',
	'/rbac/role',
	'/rbac/role/{id}',
	'/rbac/role/updateDefinition/{id}',
	'/rbac/role/name/{id}',
];

const adminOnlyUrls = [
	'/rbac/app/{id}',
	'/rbac/app',
];

const superAdminOnlyUrls = [
	'/rbac/app/audit',
	'/rbac/app/audit/count',
	'/rbac/app/ipwhitelisting',
	'/rbac/usr/count',
	'/rbac/usr',
	'/rbac/usr/bulkCreate/{fileId}/validate',
	'/rbac/usr/bulkCreate/{fileId}',
	'/rbac/usr/bulkCreate/{fileId}/download',
	'/rbac/usr/bulkCreate/{fileId}/count',
	'/rbac/usr/bulkCreate/{fileId}/userList',
	'/rbac/usr/{id}',
	'/rbac/usr/{usrId}/appList',
	'/rbac/usr/{id}/password',
	'/rbac/usr/{usrId}/addToApps',
	'/rbac/usr/{userId}/operations',
	'/rbac/usr/audit',
	'/rbac/usr/audit/count',
	'/rbac/{idType}/roles',
	'/rbac/group',
	'/rbac/group/{id}',
	'/rbac/group/count',
	'/rbac/usr/{userId}/superAdmin/{action}',
];

const commonUrls = [
	'/rbac/app',
	'/rbac/app/{id}',
	'/rbac/usr/app/{app}',
	'/rbac/usr/app/{app}/{userId}',
	'/rbac/usr/app/{app}/count',
	'/rbac/usr/app/{app}/create',
	'/rbac/usr/app/{app}/distinctAttributes',
	'/rbac/usr/reviewpermission/{app}',
	'/rbac/usr/{username}/{app}/import',
	'/rbac/usr/{id}/closeAllSessions',
	'/rbac/usr/{id}/reset',
	'/rbac/usr/{userId}/appAdmin/{action}',
	'/rbac/usr/{usrId}/addToGroups',
	'/rbac/usr/{usrId}/removeFromGroups',
	'/rbac/bot/app/{app}',
	'/rbac/bot/app/{app}/count',
	'/rbac/bot/botKey/{_id}',
	'/rbac/bot/botKey/session/{_id}',
	'/rbac/{userType}/{_id}/status/{userState}',
	'/rbac/{usrType}/app/{app}/{groupId}/count',
	'/rbac/{usrType}/app/{app}/{groupId}',
	'/rbac/{app}/group',
	'/rbac/{app}/group/count',
	'/rbac/app/{app}/bookmark/count',
	'/rbac/app/{app}/bookmark',
	'/rbac/app/{app}/bookmark/bulkDelete',
	'/rbac/app/{app}/bookmark/{id}',
	'/rbac/app/{app}/removeUsers',
	'/rbac/app/{app}/removeBots',
	'/rbac/app/{app}/addUsers',
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

function canAccessPath(req) {
	if (compareURL('/rbac/app/', req.path) && req.method === 'GET') {
		return true;
	}
	if (compareURL('/rbac/app/{id}', req.path) && req.method === 'GET') {
		return true;
	}
	if (compareURL('/rbac/usr/app/{app}', req.path) && _.intersectionWith(req.appPermissions, ['PMU', 'PVU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/usr/app/{app}/count', req.path) && _.intersectionWith(req.appPermissions, ['PMU', 'PVU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/usr/app/{app}/create', req.path) && _.intersection(req.appPermissions, ['PMUBC']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/usr/app/{app}/distinctAttributes', req.path) && _.intersectionWith(req.appPermissions, ['PMU', 'PVU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/usr/reviewpermission/{app}', req.path) && _.intersectionWith(req.appPermissions, ['PMU', 'PVU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/usr/{username}/{app}/import', req.path) && _.intersection(req.appPermissions, ['PMUBC']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/usr/{id}/closeAllSessions', req.path) && _.intersection(req.appPermissions, ['PMUA']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/usr/{id}/reset', req.path) && _.intersection(req.appPermissions, ['PMUBU']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/usr/{userId}/appAdmin/{action}', req.path) && _.intersection(req.appPermissions, ['PMUBU']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/usr/{usrId}/addToGroups', req.path) && _.intersection(req.appPermissions, ['PMUG']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/usr/{usrId}/removeFromGroups', req.path) && _.intersection(req.appPermissions, ['PMUG']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/bot/app/{app}', req.path) && _.intersectionWith(req.appPermissions, ['PMB', 'PVB'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/bot/app/{app}/count', req.path) && _.intersectionWith(req.appPermissions, ['PMB', 'PVB'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/bot/botKey/{_id}', req.path) && _.intersection(req.appPermissions, ['PMBA']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/bot/botKey/session/{_id}', req.path) && _.intersection(req.appPermissions, ['PMBA']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{userType}/{_id}/status/{userState}', req.path) && _.intersection(req.appPermissions, ['PMUBU', 'PMBBU']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{usrType}/app/{app}/{groupId}/count', req.path) && _.intersection(req.appPermissions, ['PMUG']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{usrType}/app/{app}/{groupId}', req.path) && _.intersection(req.appPermissions, ['PMUG']).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/group', req.path) && _.intersectionWith(req.appPermissions, ['PMG', 'PVG'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/{app}/group/count', req.path) && _.intersectionWith(req.appPermissions, ['PMG', 'PVG'], comparator).length > 0) {
		return true;
	}
	// if (compareURL('/rbac/app/{app}/bookmark/count', req.path) && _.intersection(req.appPermissions, ['']).length > 0) {
	// 	return true;
	// }
	// if (compareURL('/rbac/app/{app}/bookmark', req.path) && _.intersection(req.appPermissions, ['']).length > 0) {
	// 	return true;
	// }
	// if (compareURL('/rbac/app/{app}/bookmark/bulkDelete', req.path) && _.intersection(req.appPermissions, ['']).length > 0) {
	// 	return true;
	// }
	// if (compareURL('/rbac/app/{app}/bookmark/{id}', req.path) && _.intersection(req.appPermissions, ['']).length > 0) {
	// 	return true;
	// }
	if (compareURL('/rbac/app/{app}/removeUsers', req.path) && _.intersectionWith(req.appPermissions, ['PMU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/app/{app}/removeBots', req.path) && _.intersectionWith(req.appPermissions, ['PMB'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/rbac/app/{app}/addUsers', req.path) && _.intersectionWith(req.appPermissions, ['PMU'], comparator).length > 0) {
		return true;
	}
	return false;
}

function comparator(main, pattern) {
	return main.startsWith(pattern);
}

module.exports = router;
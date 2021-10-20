const router = require('express').Router();
const { AuthCacheMW } = require('@appveen/ds-auth-cache');
const _ = require('lodash');
const config = require('../config/config');

const logger = global.logger;

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
	'/rbac/refresh'
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
	'/app/{id}',
	'/app',
];

const superAdminOnlyUrls = [
	'/app/audit',
	'/app/audit/count',
	'/app/ipwhitelisting',
	'/usr/count',
	'/usr',
	'/usr/bulkCreate/{fileId}/validate',
	'/usr/bulkCreate/{fileId}',
	'/usr/bulkCreate/{fileId}/download',
	'/usr/bulkCreate/{fileId}/count',
	'/usr/bulkCreate/{fileId}/userList',
	'/usr/reviewpermissionservice/{entity}',
	'/usr/{id}',
	'/usr/{usrId}/appList',
	'/usr/{id}/password',
	'/usr/{usrId}/addToApps',
	'/usr/{userId}/operations',
	'/usr/audit',
	'/usr/audit/count',
	'/{idType}/roles',
	'/group',
	'/group/{id}',
	'/group/count',
	'/usr/{userId}/superAdmin/{action}',
];

const commonUrls = [
	'/usr/app/{app}',
	'/usr/app/{app}/count',
	'/usr/app/{app}/create',
	'/usr/app/{app}/distinctAttributes',
	'/usr/reviewpermission/{app}',
	'/usr/{username}/{app}/import',
	'/usr/{id}/closeAllSessions',
	'/usr/{id}/reset',
	'/usr/{userId}/appAdmin/{action}',
	'/usr/{usrId}/addToGroups',
	'/usr/{usrId}/removeFromGroups',
	'/bot/app/{app}',
	'/bot/app/{app}/count',
	'/bot/botKey/{_id}',
	'/bot/botKey/session/{_id}',
	'/{userType}/{_id}/status/{userState}',
	'/{usrType}/app/{app}/{groupId}/count',
	'/{usrType}/app/{app}/{groupId}',
	'/{app}/group',
	'/{app}/group/count',
	'/app/{app}/bookmark/count',
	'/app/{app}/bookmark',
	'/app/{app}/bookmark/bulkDelete',
	'/app/{app}/bookmark/{id}',
	'/app/{app}/removeUsers',
	'/app/{app}/removeBots',
	'/app/{app}/addUsers',
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
			req.user.appPermissions = req.user.allPermissions.find(e => e.app === req.locals.app) || [];
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
	if (compareURL('/usr/app/{app}', req.path) && _.intersectionWith(req.appPermissions, ['PMU', 'PVU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/usr/app/{app}/count', req.path) && _.intersectionWith(req.appPermissions, ['PMU', 'PVU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/usr/app/{app}/create', req.path) && _.intersection(req.appPermissions, ['PMUBC']).length > 0) {
		return true;
	}
	if (compareURL('/usr/app/{app}/distinctAttributes', req.path) && _.intersectionWith(req.appPermissions, ['PMU', 'PVU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/usr/reviewpermission/{app}', req.path) && _.intersectionWith(req.appPermissions, ['PMU', 'PVU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/usr/{username}/{app}/import', req.path) && _.intersection(req.appPermissions, ['PMUBC']).length > 0) {
		return true;
	}
	if (compareURL('/usr/{id}/closeAllSessions', req.path) && _.intersection(req.appPermissions, ['PMUA']).length > 0) {
		return true;
	}
	if (compareURL('/usr/{id}/reset', req.path) && _.intersection(req.appPermissions, ['PMUBU']).length > 0) {
		return true;
	}
	if (compareURL('/usr/{userId}/appAdmin/{action}', req.path) && _.intersection(req.appPermissions, ['PMUBU']).length > 0) {
		return true;
	}
	if (compareURL('/usr/{usrId}/addToGroups', req.path) && _.intersection(req.appPermissions, ['PMUG']).length > 0) {
		return true;
	}
	if (compareURL('/usr/{usrId}/removeFromGroups', req.path) && _.intersection(req.appPermissions, ['PMUG']).length > 0) {
		return true;
	}
	if (compareURL('/bot/app/{app}', req.path) && _.intersectionWith(req.appPermissions, ['PMB', 'PVB'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/bot/app/{app}/count', req.path) && _.intersectionWith(req.appPermissions, ['PMB', 'PVB'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/bot/botKey/{_id}', req.path) && _.intersection(req.appPermissions, ['PMBA']).length > 0) {
		return true;
	}
	if (compareURL('/bot/botKey/session/{_id}', req.path) && _.intersection(req.appPermissions, ['PMBA']).length > 0) {
		return true;
	}
	if (compareURL('/{userType}/{_id}/status/{userState}', req.path) && _.intersection(req.appPermissions, ['PMUBU', 'PMBBU']).length > 0) {
		return true;
	}
	if (compareURL('/{usrType}/app/{app}/{groupId}/count', req.path) && _.intersection(req.appPermissions, ['PMUG']).length > 0) {
		return true;
	}
	if (compareURL('/{usrType}/app/{app}/{groupId}', req.path) && _.intersection(req.appPermissions, ['PMUG']).length > 0) {
		return true;
	}
	if (compareURL('/{app}/group', req.path) && _.intersectionWith(req.appPermissions, ['PMG', 'PVG'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/{app}/group/count', req.path) && _.intersectionWith(req.appPermissions, ['PMG', 'PVG'], comparator).length > 0) {
		return true;
	}
	// if (compareURL('/app/{app}/bookmark/count', req.path) && _.intersection(req.appPermissions, ['']).length > 0) {
	// 	return true;
	// }
	// if (compareURL('/app/{app}/bookmark', req.path) && _.intersection(req.appPermissions, ['']).length > 0) {
	// 	return true;
	// }
	// if (compareURL('/app/{app}/bookmark/bulkDelete', req.path) && _.intersection(req.appPermissions, ['']).length > 0) {
	// 	return true;
	// }
	// if (compareURL('/app/{app}/bookmark/{id}', req.path) && _.intersection(req.appPermissions, ['']).length > 0) {
	// 	return true;
	// }
	if (compareURL('/app/{app}/removeUsers', req.path) && _.intersectionWith(req.appPermissions, ['PMU'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/app/{app}/removeBots', req.path) && _.intersectionWith(req.appPermissions, ['PMB'], comparator).length > 0) {
		return true;
	}
	if (compareURL('/app/{app}/addUsers', req.path) && _.intersectionWith(req.appPermissions, ['PMU'], comparator).length > 0) {
		return true;
	}
	return false;
}

function comparator(main, pattern) {
	return main.startsWith(pattern);
}

module.exports = router;
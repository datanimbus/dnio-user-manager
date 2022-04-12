'use strict';
//controllers
const KeyController = require('./keys.controller');
const UserController = require('./user.controller.js');
const AppController = require('./app.controller.js');
const RolesController = require('./roles.controller.js');
const PerferencesController = require('./preferences.controller.js');
const GroupController = require('./group.controller.js');
const ServiceController = require('./service.controller.js');
const WorkflowController = require('./workflow.controller.js');
// const LdapController = require('./ldap.controller.js');
const ConfigController = require('./config.controller');
const FilterController = require('./filter.controller');
const UserAuditController = require('./user.audit.controller.js');
const AppAuditController = require('./app.audit.controller.js');
const PerferencesAuditController = require('./preferences.audit.controller.js');
const BulkCreateController = require('./bulkCreate.controller.js');
const BookmarkController = require('./bookmark.controller.js');
const PartnerController = require('./partner.controller.js');


AppController.init()
	.then(() => RolesController.init())
	.then(() => UserController.init());

//exports
// var exports = {};
// exports.UserCreate = UserController.create;
// exports.authType = UserController.authType;
// exports.UserList = UserController.index;
// exports.UserShow = UserController.show;
// exports.UserDestroy = UserController.destroy;
// exports.UserUpdate = UserController.update;
// exports.UserCount = UserController.count;
// exports.UserAudit = UserAuditController.index;
// exports.UserAuditCount = UserAuditController.count;
// exports.UserUpdatePassword = UserController.updatePassword;
// exports.UserResetPassword = UserController.resetPassword;
// exports.UserRolesListing = UserController.getRolesList;
// exports.UserRolesType = UserController.getRolesType;
// exports.UserAllRoles = UserController.getAllRolesofUser;
// exports.UserAppList = UserController.getUserAppList;
// exports.UserCloseSessionsForUser = UserController.closeAllSessionForUser;
// // exports.UserCloseSessions = UserController.closeAllSession;
// exports.UserHB = UserController.heartBeatAPI;
// exports.LdapUserImport = UserController.importLdapUser;
// exports.health = UserController.health;
// exports.readiness = UserController.readiness;
// exports.BulkAddUserValidate = UserController.bulkAddUserValidate;
// exports.BulkAddUserCreate = UserController.bulkAddUserCreate;
// exports.BulkAddUserDownload = UserController.bulkAddUserDownload;

// exports.BulkCreateUserCount = BulkCreateController.bulkUserCount;
// exports.BulkCreateUserList = BulkCreateController.bulkUserIndex;

// exports.BookmarkCreate=BookmarkController.create;
// exports.BookmarkUpdate=BookmarkController.update;
// exports.BookmarkDelete=BookmarkController.delete;
// exports.BookmarkList = BookmarkController.customIndex;
// exports.BookmarkCount = BookmarkController.customCount;
// exports.BookmarkShow = BookmarkController.show;
// exports.BookmarkBulkDelete = BookmarkController.bulkDelete;

// exports.UserLocalLogin = UserController.localLogin;
// exports.UserLdapLogin = UserController.ldapLogin;
// exports.UserLogout = UserController.logout;
// exports.UserValidateUserSession = UserController.validateUserSession;
// exports.UserCheckUserSession = UserController.checkUserSession;
// exports.UserExtendUserSession = UserController.extendSession;
// exports.UserRefreshUserSession = UserController.refreshToken;
// exports.UserAzureLogin = UserController.azureLogin;
// exports.UserAzureLoginCallback = UserController.azureLoginCallback;
// // exports.AzureUserFetch = UserController.azureUserFetch,
// // exports.AzureUserFetchCallback = UserController.azureUserFetchCallback,
// exports.CreateUserAddToGroup = UserController.createUserinGroups;
// exports.UserAddToGroup = UserController.addUserToGroups;
// exports.UserRemoveFromGroup = UserController.removeUserFromGroups;
// exports.UserEditAppAdmin = UserController.editAppAdmin;
// exports.UserEditSuperAdmin = UserController.editSuperAdmin;
// exports.UserAddToApps = UserController.addUserToApps;
// exports.UserImportToApp = UserController.importUserToApp;
// exports.UserInApp = UserController.userInApp;
// exports.BotInApp = UserController.botInApp;
// exports.UserInAppCount = UserController.userInAppCount;
// exports.UserInAppShow = UserController.userInAppShow;
// exports.UserInGroup = UserController.UserInGroup;
// exports.UserInGroupCount = UserController.UserInGroupCount;
// exports.distinctUserAttribute = UserController.distinctUserAttribute;
// exports.BotInAppCount = UserController.botInAppCount;
// // exports.UserChangeADAttribute = UserController.fixAllADUsers;
// // exports.UserADFix = UserController.fixSingleADUsers;
// // exports.UserADEmailFix = UserController.refreshADEmail;

// exports.ConfigList = ConfigController.index;
// exports.ConfigShow = ConfigController.show;

// // exports.LdapTestConnection = LdapController.testConnection;
// // exports.LdapTestMapping = LdapController.testAuth;
// // exports.LdapSearchUsers = LdapController.searchUsers;
// // exports.LdapSaveConnection = LdapController.saveConnection;
// // exports.AzureCode = LdapController.authorizationRequestCallback;

// exports.AppCreate = AppController.create;
// exports.AppList = AppController.index;
// exports.AppShow = AppController.show;
// exports.AppUpdate = AppController.update;
// exports.AppDestroy = AppController.destroy;
// exports.AppAudit = AppAuditController.index;
// exports.AppAuditCount = AppAuditController.count;
// exports.AppRemoveUsers = AppController.removeUserFromApp;
// exports.AppRemoveBots = AppController.removeBotFromApp;
// exports.AppAddUsers = AppController.addUsersToApp;
// exports.AppIPlist = AppController.fetchIPwhitelisting;

// exports.RolesCreate = RolesController.create;
// exports.RolesList = RolesController.index;
// exports.RolesShow = RolesController.show;
// exports.RolesUpdate = RolesController.update;
// exports.RolesDestroy = RolesController.destroy;
// exports.RolesDefinitionUpdate = RolesController.changeRolesDefinition;
// exports.RolesNameShow = RolesController.getRoleName;

// exports.ApproversList = WorkflowController.getApproversList;

// exports.ServiceDestroy = ServiceController.destroy;
// exports.ServiceCreate = ServiceController.create;
// exports.LibraryDestroy = ServiceController.deleteLibrary;
// exports.LibraryCreate = ServiceController.createLibrary;

// exports.PartnerDestroy = PartnerController.destroy;
// exports.PartnerCreate = PartnerController.create;
// exports.FlowDestroy = PartnerController.destroyFlow;
// exports.NSCreate = PartnerController.CreateNs;
// exports.NSDestroy = PartnerController.destroyNS;
// exports.DFDestroy = PartnerController.destroyDF;

// exports.PreferencesCreate = PerferencesController.create;
// exports.PreferencesList = PerferencesController.index;
// exports.PreferencesShow = PerferencesController.show;
// exports.PreferencesUpdate = PerferencesController.update;
// exports.PreferencesDestroy = PerferencesController.destroy;
// exports.PreferencesAudit = PerferencesAuditController.index;
// exports.PreferencesAuditCount = PerferencesAuditController.count;

// exports.FilterCreate = FilterController.create;
// exports.FilterList = FilterController.index;
// exports.FilterShow = FilterController.show;
// exports.FilterUpdate = FilterController.update;
// exports.FilterDestroy = FilterController.destroy;

// exports.GroupCreate = GroupController.create;
// exports.GroupList = GroupController.index;
// exports.GroupShow = GroupController.show;
// exports.GroupUpdate = GroupController.update;
// exports.GroupDestroy = GroupController.destroy;
// exports.GroupCount = GroupController.count;
// exports.GroupInApp = GroupController.groupInApp;
// exports.GroupInAppShow = GroupController.groupInAppShow;
// exports.GroupInAppCount = GroupController.groupInAppCount;

// exports.ReviewPermission = RolesController.reviewPermission;
// exports.ReviewPermissionService = RolesController.reviewPermissionService;

// exports.createBotKey = UserController.createBotKey;
// exports.updateBotKey = UserController.updateBotKey;
// exports.deleteBotKey = UserController.deleteBotKey;
// exports.endBotKeySession = UserController.endBotKeySession;
// exports.disableUser = UserController.disableUser;
// exports.GetKeysOfApp = KeyController.GetKeysOfApp;
// module.exports = exports;


const router = require('express').Router();

router.get('/usr', mapSwaggerParams, UserController.index);
router.post('/usr', mapSwaggerParams, UserController.create);
router.get('/usr/app/:app', mapSwaggerParams, UserController.userInApp);
router.get('/bot/app/:app', mapSwaggerParams, UserController.botInApp);
router.put('/usr/bulkCreate/:fileId/validate', mapSwaggerParams, UserController.bulkAddUserValidate);
router.post('/usr/bulkCreate/:fileId', mapSwaggerParams, UserController.bulkAddUserCreate);
router.get('/usr/bulkCreate/:fileId/download', mapSwaggerParams, UserController.bulkAddUserDownload);
router.get('/usr/bulkCreate/:fileId/count', mapSwaggerParams, BulkCreateController.bulkUserCount);
router.get('/usr/bulkCreate/:fileId/userList', mapSwaggerParams, BulkCreateController.bulkUserIndex);
router.get('/usr/count', mapSwaggerParams, UserController.count);
router.get('/usr/app/:app/count', mapSwaggerParams, UserController.userInAppCount);
router.get('/usr/app/:app/distinctAttributes', mapSwaggerParams, UserController.distinctUserAttribute);
router.get('/bot/app/:app/count', mapSwaggerParams, UserController.botInAppCount);
router.get('/usr/reviewpermission/:app', mapSwaggerParams, RolesController.reviewPermission);
router.get('/usr/reviewpermissionservice/:entity', mapSwaggerParams, RolesController.reviewPermissionService);
router.get('/usr/:id', mapSwaggerParams, UserController.show);
router.put('/usr/:id', mapSwaggerParams, UserController.update);
router.delete('/usr/:id', mapSwaggerParams, UserController.destroy);
router.get('/usr/:id/allRoles', mapSwaggerParams, UserController.getAllRolesofUser);
router.get('/usr/:usrId/appList', mapSwaggerParams, UserController.getUserAppList);
router.put('/usr/:id/password', mapSwaggerParams, UserController.updatePassword);
router.put('/usr/:userId/appAdmin/:action', mapSwaggerParams, UserController.editAppAdmin);
router.put('/usr/:userId/superAdmin/:action', mapSwaggerParams, UserController.editSuperAdmin);
router.get('/:idType/roles', mapSwaggerParams, UserController.getRolesList);
router.get('/usr/:userId/operations', mapSwaggerParams, UserController.getRolesType);
router.put('/usr/:id/reset', mapSwaggerParams, UserController.resetPassword);
router.put('/usr/hb', mapSwaggerParams, UserController.heartBeatAPI);
router.get('/usr/audit', mapSwaggerParams, UserAuditController.index);
router.get('/usr/audit/count', mapSwaggerParams, UserAuditController.count);
router.post('/usr/app/:app/create', mapSwaggerParams, UserController.createUserinGroups);
router.get('/usr/app/:app/:id', mapSwaggerParams, UserController.userInAppShow);
router.put('/usr/:usrId/addToGroups', mapSwaggerParams, UserController.addUserToGroups);
router.put('/usr/:usrId/removeFromGroups', mapSwaggerParams, UserController.removeUserFromGroups);
router.put('/usr/:usrId/addToApps', mapSwaggerParams, UserController.addUserToApps);
router.put('/usr/:username/:app/import', mapSwaggerParams, UserController.importUserToApp);
router.get('/group', mapSwaggerParams, GroupController.index);
router.post('/group', mapSwaggerParams, GroupController.create);
router.get('/group/:id', mapSwaggerParams, GroupController.show);
router.put('/group/:id', mapSwaggerParams, GroupController.update);
router.delete('/group/:id', mapSwaggerParams, GroupController.destroy);
router.get('/:app/group', mapSwaggerParams, GroupController.groupInApp);
router.get('/:app/group/count', mapSwaggerParams, GroupController.groupInAppCount);
router.get('/:app/group/:id', mapSwaggerParams, GroupController.groupInAppShow);
router.get('/:app/group/:groupId/:usrType/count', mapSwaggerParams, UserController.UserInGroupCount);
router.get('/:app/group/:groupId/:usrType', mapSwaggerParams, UserController.UserInGroup);
router.get('/:app/keys', mapSwaggerParams, KeyController.GetKeysOfApp);
router.get('/preferences', mapSwaggerParams, PerferencesController.index);
router.post('/preferences', mapSwaggerParams, PerferencesController.create);
router.get('/filter', mapSwaggerParams, FilterController.index);
router.post('/filter', mapSwaggerParams, FilterController.create);
router.get('/filter/:id', mapSwaggerParams, FilterController.show);
router.put('/filter/:id', mapSwaggerParams, FilterController.update);
router.delete('/filter/:id', mapSwaggerParams, FilterController.destroy);
router.get('/group/count', mapSwaggerParams, GroupController.count);
router.get('/preferences/:id', mapSwaggerParams, PerferencesController.show);
router.put('/preferences/:id', mapSwaggerParams, PerferencesController.update);
router.delete('/preferences/:id', mapSwaggerParams, PerferencesController.destroy);
router.get('/preferences/audit', mapSwaggerParams, PerferencesAuditController.index);
router.get('/preferences/audit/count', mapSwaggerParams, PerferencesAuditController.count);
router.post('/login', mapSwaggerParams, UserController.localLogin);
router.post('/ldap/login', mapSwaggerParams, UserController.ldapLogin);
router.get('/azure/login', mapSwaggerParams, UserController.azureLogin);
router.delete('/logout', mapSwaggerParams, UserController.logout);
router.delete('/usr/:id/closeAllSessions', mapSwaggerParams, UserController.closeAllSessionForUser);
router.get('/validate', UserController.validateUserSession);
router.get('/check', UserController.checkUserSession);
router.get('/extend', UserController.extendSession);
router.get('/refresh', UserController.refreshToken);
router.get('/config', mapSwaggerParams, ConfigController.show);
router.get('/config/:id', mapSwaggerParams, AppController.index);
router.get('/app', mapSwaggerParams, AppController.create);
router.get('/app/:id', mapSwaggerParams, AppController.show);
router.put('/app/:id', mapSwaggerParams, AppController.update);
router.delete('/app/:id', mapSwaggerParams, AppController.destroy);
router.get('/app/audit', mapSwaggerParams, AppAuditController.index);
router.get('/app/audit/count', mapSwaggerParams, AppAuditController.count);
router.put('/app/:app/removeUsers', mapSwaggerParams, AppController.removeUserFromApp);
router.put('/app/:app/removeBots', mapSwaggerParams, AppController.removeBotFromApp);
router.put('/app/:app/addUsers', mapSwaggerParams, AppController.addUsersToApp);
router.get('/app/ipwhitelisting', mapSwaggerParams, AppController.fetchIPwhitelisting);
router.get('/role', mapSwaggerParams, RolesController.index);
router.post('/role', mapSwaggerParams, RolesController.create);
router.get('/role/:id', mapSwaggerParams, RolesController.show);
router.put('/role/:id', mapSwaggerParams, RolesController.update);
router.delete('/role/:id', mapSwaggerParams, RolesController.destroy);
router.get('/app/:app/bookmark/count', mapSwaggerParams, BookmarkController.customCount);
router.get('/app/:app/bookmark', mapSwaggerParams, BookmarkController.create);
router.post('/app/:app/bookmark', mapSwaggerParams, BookmarkController.customIndex);
router.delete('/app/:app/bookmark/bulkDelete', mapSwaggerParams, BookmarkController.bulkDelete);
router.get('/app/:app/bookmark/:id', mapSwaggerParams, BookmarkController.show);
router.put('/app/:app/bookmark/:id', mapSwaggerParams, BookmarkController.update);
router.delete('/app/:app/bookmark/:id', mapSwaggerParams, BookmarkController.delete);
router.put('/role/updateDefinition/:id', mapSwaggerParams, RolesController.changeRolesDefinition);
router.get('/role/name/:id', mapSwaggerParams, RolesController.getRoleName);
router.post('/service/:id', mapSwaggerParams, ServiceController.create);
router.delete('/service/:id', mapSwaggerParams, ServiceController.destroy);
router.post('/library/:id', mapSwaggerParams, ServiceController.createLibrary);
router.delete('/library/:id', mapSwaggerParams, ServiceController.deleteLibrary);
router.post('/partner/:id', mapSwaggerParams, PartnerController.create);
router.delete('/partner/:id', mapSwaggerParams, PartnerController.destroy);
router.delete('/flow/:id', mapSwaggerParams, PartnerController.destroyFlow);
router.post('/nanoservice/:id', mapSwaggerParams, PartnerController.CreateNs);
router.delete('/nanoservice/:id', mapSwaggerParams, PartnerController.destroyNS);
router.delete('/dataformat/:id', mapSwaggerParams, PartnerController.destroyDF);
router.get('/approvers', mapSwaggerParams, WorkflowController.getApproversList);
router.get('/health/live', mapSwaggerParams, UserController.health);
router.get('/health/ready', mapSwaggerParams, UserController.readiness);
router.get('/azure/login/callback', mapSwaggerParams, UserController.azureLoginCallback);
router.get('/authType/:userName', mapSwaggerParams, UserController.authType);
router.post('/bot/botKey/:_id', mapSwaggerParams, UserController.createBotKey);
router.put('/bot/botKey/:_id', mapSwaggerParams, UserController.updateBotKey);
router.delete('/bot/botKey/:_id', mapSwaggerParams, UserController.deleteBotKey);
router.delete('/bot/botKey/session/:_id', mapSwaggerParams, UserController.endBotKeySession);
router.put('/:userType/:_id/status/:userState', mapSwaggerParams, UserController.disableUser);

module.exports = router;


function mapSwaggerParams(req, res, next) {
	const params = {};
	Object.assign(params, req.params, req.query);
	req.swagger = {
		params
	};
	next();
}

// const logger = global.logger;

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

router.get('/usr', UserController.index);
router.post('/usr', UserController.create);
router.get('/usr/app/:app', UserController.userInApp);
router.get('/bot/app/:app', UserController.botInApp);
router.put('/usr/bulkCreate/:fileId/validate', UserController.bulkAddUserValidate);
router.post('/usr/bulkCreate/:fileId', UserController.bulkAddUserCreate);
router.get('/usr/bulkCreate/:fileId/download', UserController.bulkAddUserDownload);
router.get('/usr/bulkCreate/:fileId/count', BulkCreateController.bulkUserCount);
router.get('/usr/bulkCreate/:fileId/userList', BulkCreateController.bulkUserIndex);
router.get('/usr/count', UserController.count);
router.get('/usr/app/:app/count', UserController.userInAppCount);
router.get('/usr/app/:app/distinctAttributes', UserController.distinctUserAttribute);
router.get('/bot/app/:app/count', UserController.botInAppCount);
router.get('/usr/reviewpermission/:app', RolesController.reviewPermission);
router.get('/usr/reviewpermissionservice/:entity', RolesController.reviewPermissionService);
router.get('/usr/:id', UserController.show);
router.put('/usr/:id', UserController.update);
router.delete('/usr/:id', UserController.destroy);
router.get('/usr/:id/allRoles', UserController.getAllRolesofUser);
router.get('/usr/:usrId/appList', UserController.getUserAppList);
router.put('/usr/:id/password', UserController.updatePassword);
router.put('/usr/:userId/appAdmin/:action', UserController.editAppAdmin);
router.put('/usr/:userId/superAdmin/:action', UserController.editSuperAdmin);
router.get('/:idType/roles', UserController.getRolesList);
router.get('/usr/:userId/operations', UserController.getRolesType);
router.put('/usr/:id/reset', UserController.resetPassword);
router.put('/usr/hb', UserController.heartBeatAPI);
router.get('/usr/audit', UserAuditController.index);
router.get('/usr/audit/count', UserAuditController.count);
router.post('/usr/app/:app/create', UserController.createUserinGroups);
router.get('/usr/app/:app/:id', UserController.userInAppShow);
router.put('/usr/:usrId/addToGroups', UserController.addUserToGroups);
router.put('/usr/:usrId/removeFromGroups', UserController.removeUserFromGroups);
router.put('/usr/:usrId/addToApps', UserController.addUserToApps);
router.put('/usr/:username/:app/import', UserController.importUserToApp);
router.get('/group', GroupController.index);
router.post('/group', GroupController.create);
router.get('/group/:id', GroupController.show);
router.put('/group/:id', GroupController.update);
router.delete('/group/:id', GroupController.destroy);
router.get('/:app/group', GroupController.groupInApp);
router.get('/:app/group/count', GroupController.groupInAppCount);
router.get('/:app/group/:id', GroupController.groupInAppShow);
router.get('/:app/group/:groupId/:usrType/count', UserController.UserInGroupCount);
router.get('/:app/group/:groupId/:usrType', UserController.UserInGroup);
router.get('/:app/keys', KeyController.GetKeysOfApp);
router.get('/preferences', PerferencesController.index);
router.post('/preferences', PerferencesController.create);
router.get('/filter', FilterController.index);
router.post('/filter', FilterController.create);
router.get('/filter/:id', FilterController.show);
router.put('/filter/:id', FilterController.update);
router.delete('/filter/:id', FilterController.destroy);
router.get('/group/count', GroupController.count);
router.get('/preferences/:id', PerferencesController.show);
router.put('/preferences/:id', PerferencesController.update);
router.delete('/preferences/:id', PerferencesController.destroy);
router.get('/preferences/audit', PerferencesAuditController.index);
router.get('/preferences/audit/count', PerferencesAuditController.count);
router.post('/login', UserController.localLogin);
router.post('/ldap/login', UserController.ldapLogin);
router.get('/azure/login', UserController.azureLogin);
router.delete('/logout', UserController.logout);
router.delete('/usr/:id/closeAllSessions', UserController.closeAllSessionForUser);
router.get('/validate', UserController.validateUserSession);
router.get('/check', UserController.checkUserSession);
router.get('/extend', UserController.extendSession);
router.get('/refresh', UserController.refreshToken);
router.get('/config', ConfigController.index);
router.get('/config/:id', ConfigController.show);
router.get('/app', AppController.index);
router.post('/app', AppController.create);
router.get('/app/:id', AppController.show);
router.put('/app/:id', AppController.update);
router.delete('/app/:id', AppController.destroy);
router.get('/app/audit', AppAuditController.index);
router.get('/app/audit/count', AppAuditController.count);
router.put('/app/:app/removeUsers', AppController.removeUserFromApp);
router.put('/app/:app/removeBots', AppController.removeBotFromApp);
router.put('/app/:app/addUsers', AppController.addUsersToApp);
router.get('/app/ipwhitelisting', AppController.fetchIPwhitelisting);
router.get('/role', RolesController.index);
router.post('/role', RolesController.create);
router.get('/role/:id', RolesController.show);
router.put('/role/:id', RolesController.update);
router.get('/app/:app/bookmark/count', BookmarkController.customCount);
router.post('/app/:app/bookmark', BookmarkController.create);
router.get('/app/:app/bookmark', BookmarkController.customIndex);
router.delete('/app/:app/bookmark/bulkDelete', BookmarkController.bulkDelete);
router.get('/app/:app/bookmark/:id', BookmarkController.show);
router.put('/app/:app/bookmark/:id', BookmarkController.update);
router.delete('/app/:app/bookmark/:id', BookmarkController.delete);
router.put('/role/updateDefinition/:id', RolesController.changeRolesDefinition);
router.get('/role/name/:id', RolesController.getRoleName);
router.post('/service/:id', ServiceController.create);
router.delete('/service/:id', ServiceController.destroy);
router.post('/library/:id', ServiceController.createLibrary);
router.delete('/library/:id', ServiceController.deleteLibrary);
router.post('/partner/:id', PartnerController.create);
router.delete('/partner/:id', PartnerController.destroy);
router.delete('/flow/:id', PartnerController.destroyFlow);
router.post('/nanoservice/:id', PartnerController.CreateNs);
router.delete('/nanoservice/:id', PartnerController.destroyNS);
router.delete('/dataformat/:id', PartnerController.destroyDF);
router.get('/approvers', WorkflowController.getApproversList);
router.get('/health/live', UserController.health);
router.get('/health/ready', UserController.readiness);
router.get('/azure/login/callback', UserController.azureLoginCallback);
router.get('/authType/:userName', UserController.authType);
router.post('/bot/botKey/:_id', UserController.createBotKey);
router.put('/bot/botKey/:_id', UserController.updateBotKey);
router.delete('/bot/botKey/:_id', UserController.deleteBotKey);
router.delete('/bot/botKey/session/:_id', UserController.endBotKeySession);
router.put('/:userType/:_id/status/:userState', UserController.disableUser);

module.exports = router;
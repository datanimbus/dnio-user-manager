'use strict';
//controllers
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
const BookmarkController=require('./bookmark.controller.js');
const PartnerController = require('./partner.controller.js');


AppController.init()
	.then(() => RolesController.init())
	.then(() => UserController.init());

//exports
var exports = {};
exports.UserCreate = UserController.create;
exports.authType = UserController.authType;
exports.UserList = UserController.index;
exports.UserShow = UserController.show;
exports.UserDestroy = UserController.destroy;
exports.UserUpdate = UserController.update;
exports.UserCount = UserController.count;
exports.UserAudit = UserAuditController.index;
exports.UserAuditCount = UserAuditController.count;
exports.UserUpdatePassword = UserController.updatePassword;
exports.UserResetPassword = UserController.resetPassword;
exports.UserRolesListing = UserController.getRolesList;
exports.UserRolesType = UserController.getRolesType;
exports.UserAllRoles = UserController.getAllRolesofUser;
exports.UserAppList = UserController.getUserAppList;
exports.UserCloseSessionsForUser = UserController.closeAllSessionForUser;
// exports.UserCloseSessions = UserController.closeAllSession;
exports.UserHB = UserController.heartBeatAPI;
exports.LdapUserImport = UserController.importLdapUser;
exports.health = UserController.health;
exports.readiness = UserController.readiness;
exports.BulkAddUserValidate = UserController.bulkAddUserValidate;
exports.BulkAddUserCreate = UserController.bulkAddUserCreate;
exports.BulkAddUserDownload = UserController.bulkAddUserDownload;

exports.BulkCreateUserCount = BulkCreateController.bulkUserCount;
exports.BulkCreateUserList = BulkCreateController.bulkUserIndex;

exports.BookmarkCreate=BookmarkController.create;
exports.BookmarkUpdate=BookmarkController.update;
exports.BookmarkDelete=BookmarkController.delete;
exports.BookmarkList = BookmarkController.customIndex;
exports.BookmarkCount = BookmarkController.customCount;
exports.BookmarkShow = BookmarkController.show;
exports.BookmarkBulkDelete = BookmarkController.bulkDelete;

exports.UserLocalLogin = UserController.localLogin;
exports.UserLdapLogin = UserController.ldapLogin;
exports.UserLogout = UserController.logout;
exports.UserValidateUserSession = UserController.validateUserSession;
exports.UserCheckUserSession = UserController.checkUserSession;
exports.UserExtendUserSession = UserController.extendSession;
exports.UserRefreshUserSession = UserController.refreshToken;
exports.UserAzureLogin = UserController.azureLogin;
exports.UserAzureLoginCallback = UserController.azureLoginCallback;
// exports.AzureUserFetch = UserController.azureUserFetch,
// exports.AzureUserFetchCallback = UserController.azureUserFetchCallback,
exports.CreateUserAddToGroup = UserController.createUserinGroups;
exports.UserAddToGroup = UserController.addUserToGroups;
exports.UserRemoveFromGroup = UserController.removeUserFromGroups;
exports.UserEditAppAdmin = UserController.editAppAdmin;
exports.UserEditSuperAdmin = UserController.editSuperAdmin;
exports.UserAddToApps = UserController.addUserToApps;
exports.UserImportToApp = UserController.importUserToApp;
exports.UserInApp = UserController.userInApp;
exports.BotInApp = UserController.botInApp;
exports.UserInAppCount = UserController.userInAppCount;
exports.UserInAppShow = UserController.userInAppShow;
exports.UserInGroup = UserController.UserInGroup;
exports.UserInGroupCount = UserController.UserInGroupCount;
exports.distinctUserAttribute = UserController.distinctUserAttribute;
exports.BotInAppCount = UserController.botInAppCount;
// exports.UserChangeADAttribute = UserController.fixAllADUsers;
// exports.UserADFix = UserController.fixSingleADUsers;
// exports.UserADEmailFix = UserController.refreshADEmail;

exports.ConfigList = ConfigController.index;
exports.ConfigShow = ConfigController.show;

// exports.LdapTestConnection = LdapController.testConnection;
// exports.LdapTestMapping = LdapController.testAuth;
// exports.LdapSearchUsers = LdapController.searchUsers;
// exports.LdapSaveConnection = LdapController.saveConnection;
// exports.AzureCode = LdapController.authorizationRequestCallback;

exports.AppCreate = AppController.create;
exports.AppList = AppController.index;
exports.AppShow = AppController.show;
exports.AppUpdate = AppController.update;
exports.AppDestroy = AppController.destroy;
exports.AppAudit = AppAuditController.index;
exports.AppAuditCount = AppAuditController.count;
exports.AppRemoveUsers = AppController.removeUserFromApp;
exports.AppRemoveBots = AppController.removeBotFromApp;
exports.AppAddUsers = AppController.addUsersToApp;
exports.AppIPlist = AppController.fetchIPwhitelisting;

exports.RolesCreate = RolesController.create;
exports.RolesList = RolesController.index;
exports.RolesShow = RolesController.show;
exports.RolesUpdate = RolesController.update;
exports.RolesDestroy = RolesController.destroy;
exports.RolesDefinitionUpdate = RolesController.changeRolesDefinition;
exports.RolesNameShow = RolesController.getRoleName;

exports.ApproversList = WorkflowController.getApproversList;

exports.ServiceDestroy = ServiceController.destroy;
exports.ServiceCreate = ServiceController.create;
exports.LibraryDestroy = ServiceController.deleteLibrary;
exports.LibraryCreate = ServiceController.createLibrary;

exports.PartnerDestroy = PartnerController.destroy;
exports.PartnerCreate = PartnerController.create;
exports.FlowDestroy = PartnerController.destroyFlow;
exports.NSCreate = PartnerController.CreateNs;
exports.NSDestroy = PartnerController.destroyNS;
exports.DFDestroy = PartnerController.destroyDF;

exports.PreferencesCreate = PerferencesController.create;
exports.PreferencesList = PerferencesController.index;
exports.PreferencesShow = PerferencesController.show;
exports.PreferencesUpdate = PerferencesController.update;
exports.PreferencesDestroy = PerferencesController.destroy;
exports.PreferencesAudit = PerferencesAuditController.index;
exports.PreferencesAuditCount = PerferencesAuditController.count;

exports.FilterCreate = FilterController.create;
exports.FilterList = FilterController.index;
exports.FilterShow = FilterController.show;
exports.FilterUpdate = FilterController.update;
exports.FilterDestroy = FilterController.destroy;

exports.GroupCreate = GroupController.create;
exports.GroupList = GroupController.index;
exports.GroupShow = GroupController.show;
exports.GroupUpdate = GroupController.update;
exports.GroupDestroy = GroupController.destroy;
exports.GroupCount = GroupController.count;
exports.GroupInApp = GroupController.groupInApp;
exports.GroupInAppShow = GroupController.groupInAppShow;
exports.GroupInAppCount = GroupController.groupInAppCount;

exports.ReviewPermission = RolesController.reviewPermission;
exports.ReviewPermissionService = RolesController.reviewPermissionService;

exports.createBotKey = UserController.createBotKey;
exports.updateBotKey = UserController.updateBotKey;
exports.deleteBotKey = UserController.deleteBotKey;
exports.endBotKeySession = UserController.endBotKeySession;
exports.disableUser = UserController.disableUser;
module.exports = exports;
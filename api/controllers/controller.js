'use strict';
//controllers
const KeyController = require('./keys.controller');
const UserController = require('./user.controller.js');
const AppController = require('./app.controller.js');
const PerferencesController = require('./preferences.controller.js');
const GroupController = require('./group.controller.js');
const ConfigController = require('./config.controller');
const FilterController = require('./filter.controller');
const BulkCreateController = require('./bulkCreate.controller.js');
const BookmarkController=require('./bookmark.controller.js');


AppController.init()
	.then(() => UserController.init());

//exports
var exports = {};

//App Manage For Admin
exports.AppCreate = AppController.create;
exports.AppList = AppController.index;
exports.AppShow = AppController.show;
exports.AppUpdate = AppController.update;
exports.AppDestroy = AppController.destroy;

//User Manage For Admin
exports.UserCreate = UserController.create;
exports.UserList = UserController.index;
exports.UserShow = UserController.show;
exports.UserDestroy = UserController.destroy;
exports.UserUpdate = UserController.update;
exports.UserCount = UserController.count;
exports.UserEditSuperAdmin = UserController.editSuperAdmin;

//User Import For Admin
exports.BulkAddUserValidate = UserController.bulkAddUserValidate;
exports.BulkAddUserCreate = UserController.bulkAddUserCreate;
exports.BulkAddUserDownload = UserController.bulkAddUserDownload;
exports.BulkCreateUserCount = BulkCreateController.bulkUserCount;
exports.BulkCreateUserList = BulkCreateController.bulkUserIndex;

//Groups Manage for Admin
exports.GroupCreate = GroupController.create;
exports.GroupList = GroupController.index;
exports.GroupShow = GroupController.show;
exports.GroupUpdate = GroupController.update;
exports.GroupDestroy = GroupController.destroy;
exports.GroupCount = GroupController.count;


// exports.AppRemoveUsers = AppController.removeUserFromApp;
// exports.AppRemoveBots = AppController.removeBotFromApp;
// exports.AppAddUsers = AppController.addUsersToApp;


//Users Manage
exports.UserInApp = UserController.userInApp;
exports.UserInAppCount = UserController.userInAppCount;
exports.UserInAppShow = UserController.userInAppShow;
exports.CreateUserAddToGroup = UserController.createUserinGroups;
exports.distinctUserAttribute = UserController.distinctUserAttribute;
exports.UserCloseSessionsForUser = UserController.closeAllSessionForUser;
exports.UserEditAppAdmin = UserController.editAppAdmin;
exports.UserResetPassword = UserController.resetPassword;
exports.UserAddToGroup = UserController.addUserToGroups;
exports.UserRemoveFromGroup = UserController.removeUserFromGroups;
exports.UserAddToApps = UserController.addUserToApps;
exports.UserImportToApp = UserController.importUserToApp;
exports.disableUser = UserController.disableUser;


//Bots Manage
exports.BotInApp = UserController.botInApp;
exports.BotInAppCount = UserController.botInAppCount;
exports.BotInAppShow = UserController.userInAppShow;


exports.createBotKey = UserController.createBotKey;
exports.updateBotKey = UserController.updateBotKey;
exports.deleteBotKey = UserController.deleteBotKey;
exports.endBotKeySession = UserController.endBotKeySession;


//Groups Manage in an App
exports.groupInApp = GroupController.groupInApp;
exports.groupInAppShow = GroupController.groupInAppShow;
exports.groupInAppCount = GroupController.groupInAppCount;
exports.GroupCreate = GroupController.groupInAppCreate;
exports.GroupUpdate = GroupController.groupInAppUpdate;
exports.GroupDestroy = GroupController.groupInAppDestroy;

//Users and Bots in a Group
exports.UserInGroup = UserController.UserInGroup;
exports.UserInGroupCount = UserController.UserInGroupCount;

//App SSH Key Cert
exports.GetKeysOfApp = KeyController.GetKeysOfApp;

//User Data API
exports.UserAllRoles = UserController.getAllRolesofUser;
exports.UserAppList = UserController.getUserAppList;

//Data Preference API
exports.PreferencesCreate = PerferencesController.create;
exports.PreferencesList = PerferencesController.index;
exports.PreferencesShow = PerferencesController.show;
exports.PreferencesUpdate = PerferencesController.update;
exports.PreferencesDestroy = PerferencesController.destroy;

//Data Filter API
exports.FilterCreate = FilterController.create;
exports.FilterList = FilterController.index;
exports.FilterShow = FilterController.show;
exports.FilterUpdate = FilterController.update;
exports.FilterDestroy = FilterController.destroy;

//Config API
exports.ConfigList = ConfigController.index;
exports.ConfigShow = ConfigController.show;

//Auth API
exports.authType = UserController.authType;
exports.UserLocalLogin = UserController.localLogin;
exports.UserLdapLogin = UserController.ldapLogin;
exports.UserAzureLogin = UserController.azureLogin;
exports.UserAzureLoginCallback = UserController.azureLoginCallback;
exports.UserLogout = UserController.logout;
exports.UserUpdatePassword = UserController.updatePassword;
exports.UserValidateUserSession = UserController.validateUserSession;
exports.UserCheckUserSession = UserController.checkUserSession;
exports.UserExtendUserSession = UserController.extendSession;
exports.UserRefreshUserSession = UserController.refreshToken;
exports.UserHB = UserController.heartBeatAPI;

//App API
exports.AppIPlist = AppController.fetchIPwhitelisting;

//Bookmark API
exports.BookmarkCount = BookmarkController.customCount;
exports.BookmarkCreate=BookmarkController.create;
exports.BookmarkList = BookmarkController.customIndex;
exports.BookmarkBulkDelete = BookmarkController.bulkDelete;
exports.BookmarkShow = BookmarkController.show;
exports.BookmarkUpdate=BookmarkController.update;
exports.BookmarkDelete=BookmarkController.delete;

//Health API
exports.health = UserController.health;
exports.readiness = UserController.readiness;
module.exports = exports;
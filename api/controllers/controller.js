
// const logger = global.logger;

'use strict';
//controllers
// const KeyController = require('./keys.controller');
const UserController = require('./user.controller.js');
const AppController = require('./app.controller.js');
const PerferencesController = require('./preferences.controller.js');
const GroupController = require('./group.controller.js');
const ConfigController = require('./config.controller');
const FilterController = require('./filter.controller');
const BulkCreateController = require('./bulkCreate.controller.js');
const BookmarkController = require('./bookmark.controller.js');
const ConnectorController = require('./connectors.controller');
const APIKeyController = require('./api-keys.controller');
const MetadataController = require('./metadata.controller');
const SecretsController = require('./app-secrets.controller.js');
const EnvVariableController = require('./env.variable.controller');

AppController.init()
	.then(() => UserController.init());

const router = require('express').Router({ mergeParams: true });

router.get('/admin/app', AppController.index);
router.post('/admin/app', AppController.create);
router.get('/admin/app/:id', AppController.show);
router.put('/admin/app/:id', AppController.update);
router.delete('/admin/app/:id', AppController.destroy);
router.get('/admin/user', UserController.index);
router.post('/admin/user', UserController.create);
router.get('/admin/user/utils/count', UserController.count);
router.get('/admin/user/:id', UserController.show);
router.put('/admin/user/:id', UserController.update);
router.delete('/admin/user/:id', UserController.destroy);
router.put('/admin/user/:id/superAdmin/:action', UserController.editSuperAdmin);
router.put('/admin/user/utils/addToGroups/:id', UserController.addUserToGroups);
router.put('/admin/user/utils/removeFromGroups/:id', UserController.removeUserFromGroups);
router.put('/admin/user/utils/addToApps/:id', UserController.addUserToApps);
router.put('/admin/user/utils/appAdmin/:id/:action', UserController.editAppAdmin);
router.get('/admin/group/count', GroupController.count);
router.get('/admin/group', GroupController.index);
router.post('/admin/group', GroupController.create);
router.get('/admin/group/:id', GroupController.show);
router.put('/admin/group/:id', GroupController.update);
router.delete('/admin/group/:id', GroupController.destroy);

router.get('/admin/environmentVariable', EnvVariableController.getEnvironmentVariables);
router.put('/admin/environmentVariable', EnvVariableController.environmentVariableCreateOrUpdate);

router.get('/:app/metadata/mapper/formula/count', MetadataController.count);
router.get('/:app/metadata/mapper/formula', MetadataController.index);
router.post('/:app/metadata/mapper/formula', MetadataController.create);
router.get('/:app/metadata/mapper/formula/:id', MetadataController.show);
router.put('/:app/metadata/mapper/formula/:id', MetadataController.update);
router.delete('/:app/metadata/mapper/formula/:id', MetadataController.destroy);

router.get('/:app/formula/count', MetadataController.app.count);
router.get('/:app/formula', MetadataController.app.index);
router.post('/:app/formula', MetadataController.app.create);
router.get('/:app/formula/:id', MetadataController.app.show);
router.put('/:app/formula/:id', MetadataController.app.update);
router.delete('/:app/formula/:id', MetadataController.app.destroy);


router.get('/:app/user', UserController.userInApp);
router.post('/:app/user', UserController.createUserinGroups);
router.get('/:app/user/utils/count', UserController.userInAppCount);
router.get('/:app/user/:id', UserController.userInAppShow);
router.put('/:app/user/:id', UserController.update);
router.delete('/:app/user/:id', UserController.destroy);
// router.put('/:app/user/utils/bulkCreate/:fileId/validate', UserController.bulkAddUserValidate);
// router.post('/:app/user/utils/bulkCreate/:fileId', UserController.bulkAddUserCreate);
// router.get('/:app/user/utils/bulkCreate/:fileId/download', UserController.bulkAddUserDownload);
// router.get('/:app/user/utils/bulkCreate/:fileId/count', BulkCreateController.bulkUserCount);
// router.get('/:app/user/utils/bulkCreate/:fileId/userList', BulkCreateController.bulkUserIndex);
router.use('/:app/user/utils/bulkCreate', BulkCreateController);
router.get('/:app/user/utils/distinctAttributes', UserController.distinctUserAttribute);
router.delete('/:app/user/utils/closeAllSessions/:id', UserController.closeAllSessionForUser);
router.put('/:app/user/utils/appAdmin/:id/:action', UserController.editAppAdmin);
router.put('/:app/user/utils/reset/:id', UserController.resetPassword);
router.put('/:app/user/utils/addToGroups/:id', UserController.addUserToGroups);
router.put('/:app/user/utils/removeFromGroups/:id', UserController.removeUserFromGroups);
router.put('/:app/user/utils/import/:id', UserController.importUserToApp);
router.put('/:app/user/utils/removeUsers', AppController.removeUserFromApp);
router.put('/:app/user/utils/removeBots', AppController.removeBotFromApp);
router.get('/:app/user/utils/azure/token/new', UserController.generateNewAzureToken);
router.get('/:app/user/utils/azure/token', UserController.hasAzureToken);
router.put('/:app/user/utils/azure/search', UserController.searchUsersInAzure);
router.put('/:app/user/utils/azure/import', UserController.importUsersFromAzure);
router.put('/:app/:userType/utils/status/:id/:userState', UserController.disableUser);
router.get('/:app/bot', UserController.botInApp);
router.post('/:app/bot', UserController.createUserinGroups);
router.get('/:app/bot/utils/count', UserController.botInAppCount);
router.get('/:app/bot/:id', UserController.userInAppShow);
router.put('/:app/bot/:id', UserController.update);
router.delete('/:app/bot/:id', UserController.destroy);
router.post('/:app/bot/utils/botKey/:id', UserController.createBotKey);
router.put('/:app/bot/utils/botKey/:id', UserController.updateBotKey);
router.delete('/:app/bot/utils/botKey/:id', UserController.deleteBotKey);
router.delete('/:app/bot/utils/botKey/session/:id', UserController.endBotKeySession);
router.get('/:app/group/count', GroupController.groupInAppCount);
router.get('/:app/group', GroupController.groupInApp);
router.post('/:app/group', GroupController.create);
router.get('/:app/group/:id', GroupController.groupInAppShow);
router.put('/:app/group/:id', GroupController.update);
router.delete('/:app/group/:id', GroupController.destroy);
router.get('/:app/group/:id/:usrType/count', UserController.UserInGroupCount);
router.get('/:app/group/:id/:usrType', UserController.UserInGroup);
router.get('/:app/keys', AppController.sendEncryptionKey);

router.get('/:app/connector/utils/count', ConnectorController.count);
router.get('/:app/connector', ConnectorController.index);
router.post('/:app/connector', ConnectorController.create);
router.get('/:app/connector/:id', ConnectorController.show);
router.put('/:app/connector/:id', ConnectorController.update);
router.delete('/:app/connector/:id', ConnectorController.destroy);
router.get('/:app/connector/utils/availableConnectors', ConnectorController.listOptions);
router.post('/:app/connector/utils/test', ConnectorController.test);
router.get('/:app/connector/:id/utils/fetchTables', ConnectorController.fetchTables);
router.get('/:app/connector/:id/utils/fetchTableSchema', ConnectorController.fetchTableSchema);


router.get('/data/:id/allRoles', UserController.getAllRolesofUser);
router.get('/data/:id/appList', UserController.getUserAppList);
router.get('/data/preferences', PerferencesController.index);
router.post('/data/preferences', PerferencesController.create);
router.get('/data/preferences/:id', PerferencesController.show);
router.put('/data/preferences/:id', PerferencesController.update);
router.delete('/data/preferences/:id', PerferencesController.destroy);
router.get('/data/filter', FilterController.index);
router.post('/data/filter', FilterController.create);
router.get('/data/filter/:id', FilterController.show);
router.put('/data/filter/:id', FilterController.update);
router.delete('/data/filter/:id', FilterController.destroy);
router.get('/data/config', ConfigController.index);
router.get('/data/config/:id', ConfigController.show);
router.get('/data/app/:id', AppController.showApp);
router.put('/data/app/:id', AppController.updateApp);
router.get('/data/app', AppController.index);
router.get('/auth/authType/:id', UserController.authType);
router.post('/auth/login', UserController.localLogin);
router.post('/auth/ldap/login', UserController.ldapLogin);
router.get('/auth/azure/login', UserController.azureLogin);
router.get('/auth/azure/login/callback', UserController.azureLoginCallback);
router.delete('/auth/logout', UserController.logout);
router.put('/auth/change-password/:id', UserController.updatePassword);
router.get('/auth/validate', UserController.validateUserSession);
router.get('/auth/check', UserController.checkUserSession);
router.get('/auth/extend', UserController.extendSession);
router.get('/auth/refresh', UserController.refreshToken);
router.put('/auth/hb', UserController.heartBeatAPI);
router.get('/:app/app/ipwhitelisting', AppController.fetchIPwhitelisting);
router.get('/:app/bookmark/utils/count', BookmarkController.customCount);
router.post('/:app/bookmark', BookmarkController.create);
router.get('/:app/bookmark', BookmarkController.customIndex);
router.delete('/:app/bookmark/utils/bulkDelete', BookmarkController.bulkDelete);
router.get('/:app/bookmark/:id', BookmarkController.show);
router.put('/:app/bookmark/:id', BookmarkController.update);
router.delete('/:app/bookmark/:id', BookmarkController.delete);

router.get('/:app/apiKeys/utils/count', APIKeyController.apiKeyInAppCount);
router.post('/:app/apiKeys', APIKeyController.apiKeyInAppCreate);
router.get('/:app/apiKeys', APIKeyController.apiKeyInApp);
router.get('/:app/apiKeys/:id', APIKeyController.apiKeyInAppShow);
router.put('/:app/apiKeys/:id', APIKeyController.apiKeyInAppUpdate);
router.delete('/:app/apiKeys/:id', APIKeyController.apiKeyInAppDestroy);

// router.get('/:app/secrets', SecretsController.list);
// router.post('/:app/secrets', SecretsController.create);
// router.get('/:app/secrets/utils/count', SecretsController.count);
// router.get('/:app/secrets/:id', SecretsController.show);
// router.put('/:app/secrets/:id', SecretsController.update);
// router.delete('/:app/secrets/:id', SecretsController.destroy);

router.use('/:app/secrets', SecretsController);

router.get('/internal/health/live', UserController.health);
router.get('/internal/health/ready', UserController.readiness);

module.exports = router;

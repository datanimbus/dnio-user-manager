var assert = require('assert');
var sinon = require('sinon');
require('sinon-mongoose');
var SwaggerExpress = require('swagger-express-mw');
var mongoose = require("mongoose");
const utils = require('@appveen/utils');
const log4js = utils.logger.getLogger;
const SMCrud = require('@appveen/swagger-mongoose-crud');
const loggerName = '[usermgmt]';
const logger = log4js.getLogger(loggerName);
global.logger = logger;

const groupDefinition = require('../api/helpers/group.definition').definition;
const userDefinition = require('../api/helpers/user.definition').definition;
const appDefinition = require('../api/helpers/app.definition').definition;

var appController = require('../api/controllers/app.controller');
var groupController = require('../api/controllers/group.controller');
var userController = require('../api/controllers/user.controller');
var mockExpress = require('sinon-express-mock');
var rewire = require("rewire");

sinon.stub(require('redis'), 'createClient').returns(sinon.fake.resolves());
sinon.stub(require('node-nats-streaming'), 'connect').returns(sinon.fake.resolves());

describe("Testing app.contoller.js", function () {
    this.timeout(5000);
    var promiseResolve = sinon.fake.resolves();
    let Group = mongoose.model('group');
    let user = mongoose.model('user');

    before(() => {
        this.timeout(5000);
        sinon.stub(mongoose, "connect").callsFake(promiseResolve);
        sinon.stub(SwaggerExpress, "create").callsFake(promiseResolve);
        sinon.stub(logger, "error").callsFake();
    });

    after(() => { });

    beforeEach(() => {
    });

    afterEach(() => sinon.restore());

    it('addUsersToApp', function (done) {
        let request = {
            swagger: { params: { app: { value: "Adam" } } },
            body: {
                users: ["USR1000"],
            },
        };

        const req = mockExpress.mockReq(request)
        const res = mockExpress.mockRes()
        const response = {
            status() { return res },
            send() { },
            json() { }
        };
        const statusSpy = sinon.spy(response, 'status');
        let save = sinon.stub(Group.prototype, 'save');
        save.returns(Promise.resolve({}));
        sinon.stub(Group, "findOne").callsFake(sinon.fake.resolves(
            {
                _metadata:
                {
                    version: { document: 0 },
                    deleted: false,
                    lastUpdated: new Date(),
                    createdAt: new Date()
                },
                isActive: true,
                users: ['USR1000', 'USR1006', 'USR1000'],
                _id: 'GRP1000',
                name: '#',
                description: 'Default Group for Adam',
                app: 'Adam',
                roles: [],
                __v: 21
            }
        ));
         appController.addUsersToApp(req, response)
            .then(_d => {
                assert(statusSpy.withArgs(200).calledOnce);
                done();
            })
    });


    it('addUsersToApp1', function (done) {
        let request = {
            swagger: { params: { app: { value: "Adam" } } },
            body: {
                users: ["USR1000"],
            },
        };

        const req = mockExpress.mockReq(request)
        const res = mockExpress.mockRes()
        const response = {
            status() { return res },
            send() { },
            json() { }
        };
        const statusSpy = sinon.spy(response, 'status');
        let save = sinon.stub(Group.prototype, 'save');
        save.returns(Promise.resolve({}));
        sinon.stub(Group, "findOne").callsFake(sinon.fake.resolves(
        ));
         appController.addUsersToApp(req, response)
            .then(_d => {
                assert(statusSpy.withArgs(400).calledOnce);
                done();
            })
    });


    it('validateUser', function (done) {
        let usrIds = ["USR1001"];
        sinon.stub(user, "find").callsFake(sinon.fake.resolves(
            [{ isSuperAdmin: true, _id: 'USR1000' }]
        ));
        var sendRequest = sinon.stub(appController, 'sendRequest');
        sendRequest.returns(Promise.resolve());
        appController.validateUser('', usrIds, 'Adam', false)
            .then(_d => {
                assert.equal(_d.newUser.length, 0);
                done();
            })
    });

    it('Delete User', function (done) {
        let usrIds = ["USR1001"];
        sinon.stub(user, "find").callsFake(sinon.fake.resolves(
            [{ isSuperAdmin: true, _id: 'USR1000' }]
        ));

        var sendRequest = sinon.stub(appController, 'sendRequest');
        sendRequest.returns(Promise.resolve());
        appController.deleteUserDoc('', usrIds, 'Adam')
            .then(_d => {
                assert.equal(_d.length, 0);
                done();
            })
    });

    /*it('remove User Bot From App', function (done) {
        let request = {
            swagger: { params: { app: { value: "Adam" } } },
            body: {
                userIds: ["USR1000"],
            },
        };

        let usrIdArray = ["USR1001"];

        const req = mockExpress.mockReq(request)
        const res = mockExpress.mockRes()
        const response = {
            status() { return res },
            send() { },
            json() { }
        };
        const statusSpy = sinon.spy(response, 'status');
        sinon.stub(user, "find").callsFake(sinon.fake.resolves(
            [{
                "_id" : "USR1000",
                "_metadata" : {
                    "version" : {
                        "document" : 1
                    },
                    "deleted" : false,
                    "lastUpdated" : new Date(),
                    "createdAt" : new Date()
                },
                "isActive" : true,
                "isSuperAdmin" : true,
                "enableSessionRefresh" : true,
                "bot" : false,
                "username" : "admin",
                "basicDetails" : {
                    "name" : "John Doe",
                    "alternateEmail" : "info@appveen.com",
                    "phone" : "1234567890"
                },
                "sessionTime" : 30,
                "accessControl" : {
                    "accessLevel" : "All",
                    "apps" : null
                },
                "auth" : {
                    "authType" : "local"
                },
                "description" : "Super admin user for appveen ODP",
                "group" : [],
            }]
        ));

        sinon.stub(Group, "find").callsFake(sinon.fake.resolves(
            [{
                _metadata:
                {
                    version: { document: 0 },
                    deleted: false,
                    lastUpdated: new Date(),
                    createdAt: new Date()
                },
                isActive: true,
                users: ['USR1000', 'USR1006', 'USR1000'],
                _id: 'GRP1000',
                name: '#',
                description: 'Default Group for Adam',
                app: 'Adam',
                roles: [],
                __v: 21
            }]
        ));

        let grpSave = sinon.stub(Group.prototype, 'save');
        grpSave.returns(Promise.resolve({}));

        let usrSave = sinon.stub(user.prototype, 'save');
        usrSave.returns(Promise.resolve({}));

        appController.removeUserBotFromApp(req, response,true,[])
            .then(_d => {                 
                assert(statusSpy.withArgs(200).calledOnce);              
                done();
            })
    });
*/
    it('remove User From App', function (done) {
        let request = {
            swagger: { params: { app: { value: "Adam" } } },
            body: {
                userIds: ["USR1000"],
            },
        };

        const req = mockExpress.mockReq(request)
        const res = mockExpress.mockRes()
        const response = {
            status() { return res },
            send() { },
            json() { }
        };
        const statusSpy = sinon.spy(response, 'status');
        let validateUser = sinon.stub(appController, 'validateUser');
        validateUser.returns(Promise.resolve([]));

        let removeUserBotFromApp = sinon.stub(appController, 'removeUserBotFromApp');
        removeUserBotFromApp.returns(Promise.resolve([]));

        sinon.stub(user, "find").callsFake(sinon.fake.resolves(
            [{
                "_id" : "USR1000",
                "_metadata" : {
                    "version" : {
                        "document" : 1
                    },
                    "deleted" : false,
                    "lastUpdated" : new Date(),
                    "createdAt" : new Date()
                },
                "isActive" : true,
                "isSuperAdmin" : true,
                "enableSessionRefresh" : true,
                "bot" : false,
                "username" : "admin",
                "basicDetails" : {
                    "name" : "John Doe",
                    "alternateEmail" : "info@appveen.com",
                    "phone" : "1234567890"
                },
                "sessionTime" : 30,
                "accessControl" : {
                    "accessLevel" : "All",
                    "apps" : null
                },
                "auth" : {
                    "authType" : "local"
                },
                "description" : "Super admin user for appveen ODP",
                "group" : [],
            }]
        ));

        sinon.stub(Group, "find").callsFake(sinon.fake.resolves(
            [{
                _metadata:
                {
                    version: { document: 0 },
                    deleted: false,
                    lastUpdated: new Date(),
                    createdAt: new Date()
                },
                isActive: true,
                users: ['USR1000', 'USR1006', 'USR1000'],
                _id: 'GRP1000',
                name: '#',
                description: 'Default Group for Adam',
                app: 'Adam',
                roles: [],
                __v: 21
            }]
        ));
        var sendRequest = sinon.stub(appController, 'sendRequest');
        sendRequest.returns(Promise.resolve());

        let grpSave = sinon.stub(Group.prototype, 'save');
        grpSave.returns(Promise.resolve({}));

        let usrSave = sinon.stub(user.prototype, 'save');
        usrSave.returns(Promise.resolve([]));

        appController.removeUserFromApp(req, response)
            .then(_d => {                                                         
                assert(statusSpy.withArgs(200).calledOnce);
                done();
            })
    });

    it('remove Bot From App', function (done) {
        let request = {
            swagger: { params: { app: { value: "Adam" } } },
            body: {
                userIds: ["USR1000"],
            },
        };

        const req = mockExpress.mockReq(request)
        const res = mockExpress.mockRes()
        const response = {
            status() { return res },
            send() { },
            json() { }
        };
        const statusSpy = sinon.spy(response, 'status');
        let validateUser = sinon.stub(appController, 'validateUser');
        validateUser.returns(Promise.resolve([]));

        let removeUserBotFromApp = sinon.stub(appController, 'removeUserBotFromApp');
        removeUserBotFromApp.returns(Promise.resolve([]));

        sinon.stub(user, "find").callsFake(sinon.fake.resolves(
            [{
                "_id" : "USR1000",
                "_metadata" : {
                    "version" : {
                        "document" : 1
                    },
                    "deleted" : false,
                    "lastUpdated" : new Date(),
                    "createdAt" : new Date()
                },
                "isActive" : true,
                "isSuperAdmin" : true,
                "enableSessionRefresh" : true,
                "bot" : false,
                "username" : "admin",
                "basicDetails" : {
                    "name" : "John Doe",
                    "alternateEmail" : "info@appveen.com",
                    "phone" : "1234567890"
                },
                "sessionTime" : 30,
                "accessControl" : {
                    "accessLevel" : "All",
                    "apps" : null
                },
                "auth" : {
                    "authType" : "local"
                },
                "description" : "Super admin user for appveen ODP",
                "group" : [],
            }]
        ));

        sinon.stub(Group, "find").callsFake(sinon.fake.resolves(
            [{
                _metadata:
                {
                    version: { document: 0 },
                    deleted: false,
                    lastUpdated: new Date(),
                    createdAt: new Date()
                },
                isActive: true,
                users: ['USR1000', 'USR1006', 'USR1000'],
                _id: 'GRP1000',
                name: '#',
                description: 'Default Group for Adam',
                app: 'Adam',
                roles: [],
                __v: 21
            }]
        ));
        var sendRequest = sinon.stub(appController, 'sendRequest');
        sendRequest.returns(Promise.resolve());

        let grpSave = sinon.stub(Group.prototype, 'save');
        grpSave.returns(Promise.resolve({}));

        let usrSave = sinon.stub(user.prototype, 'save');
        usrSave.returns(Promise.resolve([]));

        appController.removeBotFromApp(req, response)
            .then(_d => {                                                         
                assert(statusSpy.withArgs(200).calledOnce);
                done();
            })
    });


});

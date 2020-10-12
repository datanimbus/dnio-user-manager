var assert = require('assert');
var sinon = require('sinon');
require('sinon-mongoose');
var SwaggerExpress = require('swagger-express-mw');
var mongoose = require("mongoose");
const utils = require('@appveen/utils');
const log4js = utils.logger.getLogger;
const loggerName = '[usermgmt]';
const logger = log4js.getLogger(loggerName);
global.logger = logger;

var userController = require('../api/controllers/user.controller');
var mockExpress = require('sinon-express-mock');
var rewire = require("rewire");

describe("Testing user.contoller.js", function () {
    this.timeout(5000);
    var promiseResolve = sinon.fake.resolves();
    let Group = mongoose.model('group');
    let User = mongoose.model('user');
    let App = mongoose.model('app');
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

    it('distinctUserAttribute', function (done) {
        let request = {
            swagger: { params: { app: { value: "Adam" } } }
        };

        const req = mockExpress.mockReq(request)
        const res = mockExpress.mockRes()
        const response = {
            status() { return res },
            send() { },
            json() { }
        };
        const statusSpy = sinon.spy(response, 'status');
        const jsonSpy = sinon.spy(response, 'json');

        sinon.stub(Group, "find").callsFake(sinon.fake.resolves(
            [{
                users: ['USR1000', 'USR1006'],
                _id: 'GRP1000'
            }, {
                users: ['USR1000'],
                _id: 'GRP1000'
            }]
        ));

        sinon.stub(User, "find").callsFake(sinon.fake.resolves(
            [
                { "_id": "USR1000", "attributes": { "status": { "type": "String", "value": "Deferred", "label": "Status" }, "salary": { "type": "Number", "value": 18000, "label": "Salary" }, "active": { "type": "Boolean", "value": false, "label": "Active" }, "phone no": { "type": "Number", "value": 9876543211, "label": "Phone no" } } },
                { "_id": "USR1006", "attributes": { "status": { "type": "String", "value": "Deferred", "label": "Status" }, "location": { "type": "String", "value": "Hyd", "label": "Location" }, "salary": { "type": "String", "value": 18000, "label": "Salary" }, "phone no": { "type": "String", "value": 9876543211, "label": "Phone no" } } }
            ]
        ));

        let expectedResBody = { "attributes": [{ "key": "status", "label": "Status", "type": "String", "properties": { "name": "Status" } }, { "key": "salary", "label": "Salary", "type": "Number", "properties": { "name": "Salary" } }, { "key": "active", "label": "Active", "type": "Boolean", "properties": { "name": "Active" } }, { "key": "phone no", "label": "Phone no", "type": "Number", "properties": { "name": "Phone no" } }, { "key": "location", "label": "Location", "type": "String", "properties": { "name": "Location" } }, { "key": "salary", "label": "Salary", "type": "String", "properties": { "name": "Salary" } }, { "key": "phone no", "label": "Phone no", "type": "String", "properties": { "name": "Phone no" } }] };

        userController.distinctUserAttribute(req, response)
            .then(_d => {
                assert(jsonSpy.withArgs(expectedResBody).calledOnce);
                done();
            })
    });

    it('updateUserAttribute', function () {
        return new Promise(function(resolve){

        let request = {
            swagger: { params: { id: { value: "USR1001" } } },
            body : {
                attributes: {
                    "a": {
                        "type": "String",
                        "value": "aa",
                        "label": "ccccccc"
                    }
                }
            }
        };

        const req = mockExpress.mockReq(request)
        const res = mockExpress.mockRes()
        const response = {
            status() { return res },
            send() { },
            json() { }
        };
        const statusSpy = sinon.spy(response, 'status');
        
        sinon.stub(User, "findOne").callsFake(sinon.fake.resolves(
            new User ({   "_id": "USR1001",
                "username": "san@appveen.com",
                "accessControl": {
                    "accessLevel": "Selected",
                    "apps": []
                },
                "lastLogin": "2019-09-05T07:52:50.411Z",
                "attributes": {
                    "a": {
                        "type": "String",
                        "value": "aa",
                        "label": "ccccccc"
                    },
                    "b": {
                        "type": "String",
                        "value": "bb",
                        "label": "ccccccc"
                    }
                }
            })
        ));

        let expectedResBody = {   "_id": "USR1001",
            "username": "san@appveen.com",
            "accessControl": {
                "accessLevel": "Selected",
                "apps": []
            },
            "lastLogin": "2019-09-05T07:52:50.411Z",
            "attributes": {
                "a": {
                "type": "String",
                "value": "aa",
                "label": "ccccccc"
                }
            }
        };
        let usrModified = sinon.stub(User.prototype, 'markModified');
        usrModified.returns(Promise.resolve(expectedResBody));

        let usrSave = sinon.stub(User.prototype, 'save');
        usrSave.returns(Promise.resolve(expectedResBody));
        
        return userController.update(req, response)
            .then(_d => {
                assert(statusSpy.withArgs(200).calledOnce);
                resolve();
            })
        });
    });

    it('Grant App Admin Access', function (done) {
        let request = {
            swagger: { params: { userId: { value: "USR1000" }, action: { value: "grant" } } },
            user: { _id: "USR1001" },
            body: { apps: ["Adam"] },
            headers: {}
        };

        const req = mockExpress.mockReq(request)
        const res = mockExpress.mockRes()
        const response = {
            status() { return res },
            send() { },
            json() { }
        };
        const statusSpy = sinon.spy(response, 'status');
        const jsonSpy = sinon.spy(response, 'json');

        sinon.stub(Group, "find").callsFake(sinon.fake.resolves(
            [new Group({
                users: ['USR1000', 'USR1006'],
                _id: 'GRP1000'
            }), new Group({
                users: ['USR1000'],
                _id: 'GRP1000'
            })]
        ));

        sinon.stub(User, "findOne").callsFake(sinon.fake.resolves(
            new User({ "_id": "USR1000", "attributes": { "status": { "type": "String", "value": "Deferred", "label": "Status" }, "salary": { "type": "Number", "value": 18000, "label": "Salary" }, "active": { "type": "Boolean", "value": false, "label": "Active" }, "phone no": { "type": "Number", "value": 9876543211, "label": "Phone no" } } }),
        ));
        let usrSave = sinon.stub(User.prototype, 'save');
        usrSave.returns(Promise.resolve([]));

        let usrModified = sinon.stub(User.prototype, 'markModified');
        usrModified.returns(Promise.resolve([]));

        userController.editAppAdmin(req, response)
            .then(_d => {                                
                assert(statusSpy.withArgs(200).calledOnce);
                done();
            })
    });

    it('Revoke App Admin Access', function (done) {
        let request = {
            swagger: { params: { userId: { value: "USR1000" }, action: { value: "revoke" } } },
            user: { _id: "USR1001" },
            body: { apps: ["Adam"] },
            headers: {}
        };

        const req = mockExpress.mockReq(request)
        const res = mockExpress.mockRes()
        const response = {
            status() { return res },
            send() { },
            json() { }
        };
        const statusSpy = sinon.spy(response, 'status');
        const jsonSpy = sinon.spy(response, 'json');

        sinon.stub(Group, "find").callsFake(sinon.fake.resolves(
            [new Group({
                users: ['USR1000', 'USR1006'],
                _id: 'GRP1000'
            }), new Group({
                users: ['USR1000'],
                _id: 'GRP1000'
            })]
        ));

        sinon.stub(User, "findOne").callsFake(sinon.fake.resolves(
            new User({ "_id": "USR1000","accessControl":{"accessLevel":"Selected","apps":["Adam"]}, "attributes": { "status": { "type": "String", "value": "Deferred", "label": "Status" }, "salary": { "type": "Number", "value": 18000, "label": "Salary" }, "active": { "type": "Boolean", "value": false, "label": "Active" }, "phone no": { "type": "Number", "value": 9876543211, "label": "Phone no" } } }),
        ));
        let usrSave = sinon.stub(User.prototype, 'save');
        usrSave.returns(Promise.resolve([]));

        let usrModified = sinon.stub(User.prototype, 'markModified');
        usrModified.returns(Promise.resolve([]));

        userController.editAppAdmin(req, response)
            .then(_d => {                                
                assert(statusSpy.withArgs(200).calledOnce);
                done();
            })
    });

    it('createUserinGroups', function (done) {
        let userObj = { "username": "sample@capiot.com", "password": "password", "cpassword": "password", "isSuperAdmin": false, "attributes": {}, "basicDetails": { "name": "Sample", "phone": null, "description": null, "alternateEmail": null }, "accessControl": { "accessLevel": "Selected", "apps": [] } };
        let request = {
            swagger: { params: { app: { value: "Adam" } } },
            body: { "user": userObj, "groups": ["GRP1001"] }
        };

        const req = mockExpress.mockReq(request)
        const res = mockExpress.mockRes()
        const response = {
            status() { return res },
            send() { },
            json() { }
        };
        const statusSpy = sinon.spy(response, 'status');
        const jsonSpy = sinon.spy(response, 'json');

        let savedUsrObj = { "username": "sample@capiot.com", "password": "password", "isSuperAdmin": false, "attributes": {}, "basicDetails": { "name": "Sample", "phone": null, "description": null, "alternateEmail": null }, "accessControl": { "accessLevel": "Selected", "apps": [] } };

        let usrSave = sinon.stub(User.prototype, 'save');
        usrSave.returns(Promise.resolve(savedUsrObj));

        let grpSave = sinon.stub(Group.prototype, 'save');
        grpSave.onCall(0).returns(Promise.resolve({
            users: ['USR1000', 'USR1006'],
            app: "Adam",
            _id: 'GRP1001'
        }));
        grpSave.onCall(1).returns(Promise.resolve({
            users: ['USR1000'],
            app: "Adam",
            _id: 'GRP1000'
        }));
        sinon.stub(Group, "find").callsFake(sinon.fake.resolves(
            [new Group({
                users: ['USR1000', 'USR1006'],
                app: "Adam",
                _id: 'GRP1001'
            }), new Group({
                users: ['USR1000'],
                _id: 'GRP1000',
                app: "Adam"
            })]
        ));
        delete savedUsrObj.password;
        let expectedResBody = { user: savedUsrObj, groups: ['GRP1001', 'GRP1000'] };
        userController.createUserinGroups(req, response)
            .then(_d => {
                assert(jsonSpy.withArgs(expectedResBody).calledOnce);
                done();
            })
    });
});

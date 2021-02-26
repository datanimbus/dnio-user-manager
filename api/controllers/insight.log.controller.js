'use strict';
let queueMgmt = require('../../util/queueMgmt');
const _ = require('lodash');
var client = queueMgmt.client;
var queue = 'user-insight';
const mongoose = require('mongoose');
let logger = global.logger;

let e = {};

e.login = (data, req, res) => {
	var body = makeBody(data, req, res);
	body.data.summary = data.username + ' logged in';
	client.publish(queue, JSON.stringify(body.data));
};

e.loginFailed = (data, req, res) => {
	if (data != null) {
		var body = makeBody(data, req, res);
		body.data.summary = 'Login failed for ' + data.username;
		client.publish(queue, JSON.stringify(body.data));
	} else {
		return res.status(404).json({
			message: 'username does not exists'
		});
	}
};

e.logout = (req, res) => {
	return mongoose.model('group').aggregate([{
		'$match': {
			'users': req.user._id
		}
	}, {
		'$group': {
			'_id': '$app'
		}
	}, {
		'$group': {
			'_id': null,
			'apps': {
				'$addToSet': '$_id'
			}
		}
	}])
		.then(_apps => {
			var body = makeBody(null, req, res);
			body.data.apps = _apps.apps;
			body.data.summary = req.user.username + ' logged out';
			logger.debug(JSON.stringify(body.data));
			client.publish(queue, JSON.stringify(body.data));
		});
};

function makeBody(data, req, res) {
	let headers = JSON.parse(JSON.stringify(req.headers));
	// For login api headers.user would be undefined
	let user = headers.user ? headers.user : data._id;
	let body = {
		data: {
			userId: user,
			txnid: headers.txnid,
			resStatusCode: res.statusCode,
			_metadata: {
				'deleted': false,
				'createdAt': new Date(),
				'lastUpdated': new Date()
			}
		}
	};
	if (data) {
		body.data.apps = data.apps;
	}
	return body;
}

e.refreshToken = (req, res) => {
	return mongoose.model('group').aggregate([{
		'$match': {
			'users': 'test@appveen.com'
		}
	}, {
		'$group': {
			'_id': '$app'
		}
	}, {
		'$group': {
			'_id': null,
			'apps': {
				'$addToSet': '$_id'
			}
		}
	}])
		.then(_apps => {
			var body = makeBody(null, req, res);
			body.data.apps = _apps.apps;
			body.data.summary = req.user.username + ' refreshed token';
			client.publish(queue, JSON.stringify(body.data));
		});
};

e.addUser = (req, res, data) => {
	let apps = [];
	return mongoose.model('group').find({
		$or: [{
			'users': req.user.id
		}, {
			'users': data._id
		}]
	}, 'app')
		.then(_grps => {
			apps = _grps.map(_g => _g.app);
			apps = _.uniq(apps);
		})
		.then(() => {
			var body = makeBody(null, req, res);
			body.data.apps = apps;
			body.data.summary = req.user.username + ' added a new user ' + data.username;
			client.publish(queue, JSON.stringify(body.data));
		});
};

e.removeUser = (req, res, data) => {
	let apps = [];
	return mongoose.model('group').find({
		'users': req.user.id
	}, 'app')
		.then(_grps => {
			apps = _grps.map(_g => _g.app);
			for (let i = 0; i < data.app.length; i++) {
				apps.push(data.app[i]);
			}
			apps = _.uniq(apps);
		})
		.then(() => {
			var body = makeBody(null, req, res);
			body.data.apps = apps;
			body.data.summary = req.user.username + ' deleted user ' + data.username;
			client.publish(queue, JSON.stringify(body.data));
		});
};

e.changePassword = (req, res) => {
	let apps = [];
	return mongoose.model('group').find({
		'users': req.user.id
	}, 'app')
		.then(_grps => {
			apps = _grps.map(_g => _g.app);
			apps = _.uniq(apps);
		})
		.then(() => {
			var body = makeBody(null, req, res);
			body.data.apps = apps;
			body.data.summary = req.user.username + ' changed password';
			client.publish(queue, JSON.stringify(body.data));
		});
};

e.superAdminAccess = (req, res, action, data) => {

	let apps = [];
	return mongoose.model('group').find({
		$or: [{
			'users': req.user.id
		}, {
			'users': data._id
		}]
	}, 'app')
		.then(_grps => {
			apps = _grps.map(_g => _g.app);
			apps = _.uniq(apps);
		})
		.then(() => {
			var body = makeBody(null, req, res);
			body.data.apps = apps;
			if (action == 'revoke') {
				body.data.summary = req.user.username + ' removed ' + data.username + ' as super admin';
			} else if (action == 'grant') {
				body.data.summary = req.user.username + ' made ' + data.username + ' as super admin';
			}

			client.publish(queue, JSON.stringify(body.data));
		});
};

e.appAdminAccess = (req, res, action, data, app) => {

	let apps = [];
	return mongoose.model('group').find({
		$or: [{
			'users': req.user.id
		}, {
			'users': data._id
		}]
	}, 'app')
		.then(_grps => {
			apps = _grps.map(_g => _g.app);
			apps = _.uniq(apps);
			var body = makeBody(null, req, res);
			body.data.apps = apps;
			if (action == 'revoke') {
				body.data.summary = req.user.username + ' removed ' + data.username + ' app admin of App ' + app;
			} else if (action == 'grant') {
				body.data.summary = req.user.username + ' made ' + data.username + ' app admin of App ' + app;
			}

			client.publish(queue, JSON.stringify(body.data));
		});
};

e.resetPassword = (req, res, data) => {
	let apps = [];
	return mongoose.model('group').find({
		$or: [{
			'users': req.user.id
		}, {
			'users': data._id
		}]
	}, 'app')
		.then(_grps => {
			apps = _grps.map(_g => _g.app);
			apps = _.uniq(apps);
		})
		.then(() => {
			var body = makeBody(null, req, res);
			body.data.apps = apps;
			body.data.summary = req.user.username + ' reset the password for user ' + data.username;
			client.publish(queue, JSON.stringify(body.data));
		});
};

e.userAddedInTeam = (req, res, data, groupDetails) => {
	let groupName = [];
	let apps = [];
	for (let i = 0; i < groupDetails.length; i++) {
		groupName.push(groupDetails[i].name);
	}
	return mongoose.model('group').find({
		$or: [{
			'users': req.user.id
		}, {
			'users': data._id
		}]
	}, 'app')
		.then(_grps => {
			apps = _grps.map(_g => _g.app);
			apps = _.uniq(apps);
		})
		.then(() => {
			var body = makeBody(null, req, res);
			body.data.apps = apps;
			body.data.summary = req.user.username + ' added ' + data.username + ' to Team ' + groupName;
			client.publish(queue, JSON.stringify(body.data));
		});
};

e.updateUser = () => {
	let mainUser = null;
	let normalUser = null;
	let apps = [];
	let body = {};


	return function (doc) {
		if (doc._auditData) {
			let oldBasicDetails = null;
			let newBasicDetails = doc.basicDetails;
			if (doc._auditData.data && doc._auditData.data.old) {
				oldBasicDetails = doc._auditData.data.old.basicDetails;
			}
			if (doc.basicDetails && doc._auditData.data && doc._auditData.data.old && doc._auditData.data.old.basicDetails && (oldBasicDetails.name != newBasicDetails.name || oldBasicDetails.phone != newBasicDetails.phone || oldBasicDetails.alternateEmail != newBasicDetails.alternateEmail)) {
				body = {
					data: {
						userId: doc._auditData.user,
						txnid: doc._auditData.txnId,
						resStatusCode: 200,
						_metadata: {
							'deleted': false,
							'createdAt': new Date(),
							'lastUpdated': new Date()
						}
					}
				};
				return getUserDetails(doc._auditData.user)
					.then(data => {
						mainUser = data.username;
						return getUserDetails(doc._auditData.data.old._id);
					})
					.then(data => {
						normalUser = data.username;
						return mongoose.model('group').find({
							$or: [{
								'users': doc._auditData.user
							}, {
								'users': doc._auditData.data.old._id
							}]
						}, 'app');
					})
					.then(_grps => {
						apps = _grps.map(_g => _g.app);
						apps = _.uniq(apps);
						body.data.apps = apps;
						body.data.summary = makeUpdatemsg(normalUser, mainUser, doc.basicDetails, doc._auditData.data.old.basicDetails);
					})
					.then(() => {
						client.publish(queue, JSON.stringify(body.data));
					});
			}
		}
	};
};

e.createUser = () => {
	let mainUser = null;
	let normalUser = null;
	let apps = [];
	let body = {};
	return function (doc) {
		try {
			if (doc._auditData && doc._auditData.user) {
				if (doc._auditData.data && (doc._auditData.data.old == null || isEmpty(doc._auditData.data.old))) {
					body = {
						data: {
							userId: doc._auditData.user,
							txnid: doc._auditData.txnId,
							resStatusCode: 200,
							_metadata: {
								'deleted': false,
								'createdAt': new Date(),
								'lastUpdated': new Date()
							}
						}
					};
					return getUserDetails(doc._auditData.user)
						.then(data => {
							mainUser = data.username;
							normalUser = doc.username;
							return mongoose.model('group').find({
								$or: [{
									'users': doc._auditData.user
								}, {
									'users': doc._id
								}]
							}, 'app');
						})
						.then(_grps => {
							apps = _grps.map(_g => _g.app);
							apps = _.uniq(apps);
							body.data.apps = apps;
							body.data.summary = mainUser + ' added a new user ' + normalUser;
						})
						.then(() => {
							client.publish(queue, JSON.stringify(body.data));
						})
						.catch(err => {
							logger.error(err);
						});
				}
			}
		} catch (err) {
			logger.error(err);
		}

	};
};

e.removeUsers = () => {
	let mainUser = null;
	let normalUser = null;
	let apps = [];
	let body = {};
	return function (doc) {
		try {
			if (doc._auditData) {
				if (doc._auditData.data && (doc._auditData.data.new == null || isEmpty(doc._auditData.data.new))) {
					body = {
						data: {
							userId: doc._auditData.user,
							txnid: doc._auditData.txnId,
							resStatusCode: 200,
							_metadata: {
								'deleted': false,
								'createdAt': new Date(),
								'lastUpdated': new Date()
							}
						}
					};
					return getUserDetails(doc._auditData.user)
						.then(data => {
							mainUser = data.username;
							normalUser = doc.username;
							return mongoose.model('group').find({
								$or: [{
									'users': doc._auditData.user
								}, {
									'users': doc._id
								}]
							}, 'app');
						})
						.then(_grps => {
							apps = _grps.map(_g => _g.app);
							apps = _.uniq(apps);
							body.data.apps = apps;
							body.data.summary = mainUser + ' deleted user ' + normalUser;
						})
						.then(() => {
							client.publish(queue, JSON.stringify(body.data));
						});
				}
			}
		} catch (err) {
			logger.error(err);
		}
	};
};

function makeUpdatemsg(user1, user2, newMsg, oldMsg) {
	let message = null;
	let actions = [];
	let oldValue = [];
	let newValue = [];
	if (newMsg.alternateEmail != oldMsg.alternateEmail) {
		actions.push('email');
		oldValue.push(oldMsg.alternateEmail);
		newValue.push(newMsg.alternateEmail);
	}
	if (newMsg.name != oldMsg.name) {
		actions.push('name');
		oldValue.push(oldMsg.name);
		newValue.push(newMsg.name);
	}
	if (newMsg.phone != oldMsg.phone) {
		actions.push('phone');
		oldValue.push(oldMsg.phone);
		newValue.push(newMsg.phone);
	}
	if (user1 != user2) {
		message = user2 + ' updated ' + actions + ' of user ' + user1 + ' from ' + oldValue + ' to ' + newValue;
	} else {
		message = user2 + ' updated ' + actions + ' from ' + oldValue + ' to ' + newValue;
	}
	return message;
}

function getUserDetails(userId) {
	return mongoose.model('user').findOne({
		_id: userId
	});
}

function isEmpty(obj) {
	return Object.keys(obj).length === 0;
}

module.exports = e;
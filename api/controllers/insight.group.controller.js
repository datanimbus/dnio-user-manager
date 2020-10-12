let queueMgmt = require('../../util/queueMgmt');
var client = queueMgmt.client;
var queue = 'group-insight';
const mongoose = require('mongoose');
const _ = require('lodash');
const logger = global.logger;

function create() {
	return function (doc) {
		let mainData = doc._auditData;
		let newData = doc;
		let app = [];
		let body = null;
		if (isEmpty(mainData.data.old)) {
			app.push(newData.app);
			body = {
				data: {
					txnid: mainData.txnId,
					_metadata: { 'deleted': false, 'createdAt': new Date(), 'lastUpdated': new Date() },
					resStatusCode: 200,
					userId: mainData.user,
					apps: app
				}
			};
			return getUserDetails(doc._auditData.user)
				.then(data => {
					if (newData.name != '#') {
						logger.info('pushing in queue');
						body.data.summary = data._id + ' created a new team ' + newData.name;
						client.publish(queue, JSON.stringify(body.data));
					}
				});

		}
	};
}

function deleteGroup() {
	return function (doc) {
		let mainData = doc._auditData;
		let newData = doc;
		let app = [];
		let body = null;
		if (mainData.data.new == null) {
			app.push(newData.app);
			body = {
				data: {
					txnid: mainData.txnId,
					_metadata: { 'deleted': false, 'createdAt': new Date(), 'lastUpdated': new Date() },
					resStatusCode: 200,
					userId: mainData.user,
					apps: app
				}
			};
			return getUserDetails(doc._auditData.user)
				.then(data => {
					body.data.summary = data._id + ' deleted team ' + newData.name;
					client.publish(queue, JSON.stringify(body.data));
				});

		}
	};
}

function updateGroup() {
	return function (doc) {
		let mainData = doc._auditData;
		// doc._auditData.user --> userId field. updates here.
		let newData = doc;
		let app = [];
		let body = null;
		let oldValue = null;
		let newValue = null;
		if (mainData.data.new != null && !isEmpty(mainData.data.old) && !isEmpty(mainData.data.new)) {
			oldValue = mainData.data.old;
			newValue = mainData.data.new;
			app.push(newData.app);
			body = {
				data: {
					txnid: mainData.txnId,
					_metadata: { 'deleted': false, 'createdAt': new Date(), 'lastUpdated': new Date() },
					resStatusCode: 200,
					userId: mainData.user,
					apps: app
				}
			};
			return Promise.resolve().then(() => {
				if (newValue.users && oldValue.users && (newValue.users.length != oldValue.users.length)) {
					let diff = [];
					let username = [];
					if (newValue.users.length > oldValue.users.length) {
						diff = arrDiff(newValue.users, oldValue.users);
						return getMultipleUserDetails(diff)
							.then(datas => {
								datas.forEach(data => username.push(data._id));
								return getUserDetails(doc._auditData.user);
							})
							.then(doc => {
								//user _id updates here??
								body.data.summary = doc._id + ' added user ' + username + ' to team ' + newData.name;
								if (newData.name != '#') {
									client.publish(queue, JSON.stringify(body.data));
								}
							});
					}
					else if (newValue.users.length < oldValue.users.length) {
						diff = arrDiff(oldValue.users, newValue.users);
						return getMultipleUserDetails(diff)
							.then(datas => {
								datas.forEach(data => username.push(data._id));
								return getUserDetails(doc._auditData.user);
							})
							.then(doc => {
								body.data.summary = doc._id + ' removed user ' + username + ' from team ' + newData.name;
								if (newData.name != '#') {
									client.publish(queue, JSON.stringify(body.data));
								}
							});

					}
				}
			})
				.then(() => {
					if (oldValue.roles && newValue.roles && (JsonArrayDiff(oldValue.roles, newValue.roles).length > 0 || JsonArrayDiff(newValue.roles, oldValue.roles).length > 0)) {
						let diff = JsonArrayDiff(oldValue.roles, newValue.roles);
						let type = [];
						diff.forEach(data => type.push(data.type));
						type = _.uniq(type);
						return getUserDetails(doc._auditData.user)
							.then(doc => {
								body.data.summary = doc._id + ' modified the ' + type + ' permissions for Team ' + newData.name;
								client.publish(queue, JSON.stringify(body.data));
							});

					}
				})
				.catch(err => {
					logger.error(err.message);
				});
		}
	};
}

function isEmpty(obj) {
	return Object.keys(obj).length === 0;
}

function getUserDetails(userId) {
	return mongoose.model('user').findOne({ _id: userId });
}

function getMultipleUserDetails(user) {
	return mongoose.model('user').find({ _id: { $in: user } });
}


function arrDiff(a1, a2) {
	var a = [], diff = [];
	for (let i = 0; i < a1.length; i++) {
		a[a1[i]] = true;
	}
	for (let i = 0; i < a2.length; i++) {
		if (a[a2[i]]) {
			delete a[a2[i]];
		} else {
			a[a2[i]] = true;
		}
	}

	for (var k in a) {
		diff.push(k);
	}
	return diff;
}

function JsonArrayDiff(a1, a2) {
	let diff = [];

	for (let i = 0; i < a1.length; i++) {
		let compare = false;
		for (let j = 0; j < a2.length; j++) {
			if (_.isEqual(a2[j], a1[i])) compare = true;
		}
		if (compare == false) {
			diff.push(a1[i]);
		}
	}

	for (let i = 0; i < a2.length; i++) {
		let compare = false;
		for (let j = 0; j < a1.length; j++) {
			if (_.isEqual(a1[j], a2[i])) compare = true;
		}
		if (compare == false) {
			diff.push(a2[i]);
		}
	}

	return diff;
}

module.exports = {
	create: create,
	deleteGroup: deleteGroup,
	updateGroup: updateGroup
};

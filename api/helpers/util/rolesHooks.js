const logger = global.logger;
const utils = require('@appveen/utils');
const mongoose = require('mongoose');
const _ = require('lodash');
const rolesInitList = require('../../../config/roles').map(obj => obj.entity);
let e = {};

e.createRolesPostHook = () => {
	return function (doc) {
		if (!doc._wasNew || rolesInitList.indexOf(doc.entity) > -1) return;
		let permName = doc.roles.map(obj => obj.id);
		let userId = doc._req.get('user');
		return mongoose.model('user').findOne({
			'_id': userId
		})
			.then(user => {
				if (user) {
					if (!user.roles) user.roles = [];
					user.roles = user.roles.concat(doc.roles.filter(_r => !_r.operations.some(_o => _o.method === 'SKIP_REVIEW')).map(_r => {
						return {
							'id': _r.id,
							'app': doc.app,
							'entity': doc.entity
						};
					}));
					return user.save(doc._req);
				}
			})
			.then(_d => {
				if (_d) {
					logger.info('Added Role ' + permName + ' in ' + _d._id);
				}
			})
			.catch(err => {
				logger.error({
					message: err.message
				});
			});
	};
};

function getRolesRemoved(rOld, rNew) {
	let rNewIds = rNew ? rNew.map(_r => _r.id) : [];
	let rOldIds = rOld ? rOld.map(_r => _r.id) : [];
	return _.difference(rOldIds, rNewIds);
}

function getRolesFilter(app, entity, roleIds) {
	let arr = roleIds.map(_rid => {
		return {
			id: _rid,
			entity: entity,
			app: app
		};
	});
	let orArr = arr.map(_r => {
		return { 'roles': { '$elemMatch': _r } };
	});
	return { '$or': orArr };
}

e.updateRolesHook = () => {
	return function (doc) {
		if (doc._oldData) {
			let rolesRemoved = getRolesRemoved(doc._oldData.roles, doc.roles);
			let rolesFilter = getRolesFilter(doc.app, doc.entity, rolesRemoved);
			if (rolesRemoved && rolesRemoved.length > 0) {
				mongoose.model('user').find(rolesFilter)
					.then(docs => {
						let promiseArr = [];
						if (docs) {
							promiseArr = docs.map(userDoc => {
								userDoc.roles = userDoc.roles.filter(obj => !(rolesRemoved.indexOf(obj.id) > -1 && obj.entity === doc.entity && obj.app === doc.app));
								return userDoc.save(doc._req);
							});
						}
						return Promise.all(promiseArr);
					})
					.then(users => {
						if (users)
							users.forEach(obj => logger.info('Removed ' + doc.roles.map(_o => _o._id) + ' from ' + obj._id));
						return mongoose.model('group').find(rolesFilter);
					})
					.then(docs => {
						let promiseArr = [];
						if (docs) {
							promiseArr = docs.map(grpDoc => {
								grpDoc.roles = grpDoc.roles.filter(obj => !(rolesRemoved.indexOf(obj.id) > -1 && obj.entity === doc.entity && obj.app === doc.app));
								return grpDoc.save(doc._req);
							});
						}
						return Promise.all(promiseArr);
					})
					.then(grps => {
						if (grps)
							grps.forEach(obj => logger.info('Removed ' + doc.roles.map(_o => _o._id) + ' from ' + obj._id));
					})
					.catch(err => {
						logger.error(err.message);
					});
			}
		}
	};
};

e.deleteRolesHook = () => {
	return function (doc) {
		let rolesFilter = { 'roles': { '$elemMatch': { 'app': doc.app, 'entity': doc.entity } } };
		mongoose.model('user').find(rolesFilter)
			.then(docs => {
				let promiseArr = [];
				if (docs) {
					promiseArr = docs.map(userDoc => {
						userDoc.roles = userDoc.roles.filter(obj => !(obj.app == doc.app, obj.entity == doc.entity));
						return userDoc.save(doc._req);
					});
				}
				return Promise.all(promiseArr);
			})
			.then(users => {
				if (users)
					users.forEach(obj => logger.info('Removed ' + doc.roles.map(_o => _o._id) + ' from ' + obj._id));
				return mongoose.model('group').find(rolesFilter);
			})
			.then(docs => {
				let promiseArr = [];
				if (docs) {
					promiseArr = docs.map(grpDoc => {
						grpDoc.roles = grpDoc.roles.filter(obj => !(obj.app == doc.app, obj.entity == doc._id));
						return grpDoc.save(doc._req);
					});
				}
				return Promise.all(promiseArr);
			})
			.then(grps => {
				if (grps)
					grps.forEach(obj => logger.info('Removed ' + doc.roles.map(_o => _o._id) + ' from ' + obj._id));
			})
			.catch(err => {
				logger.error(err.message);
			});
	};
};

e.getSkipReviewRole = (role) => {
	return {
		id: 'P' + utils.rand(10),
		name: 'Skip Review ' + role.entityName,
		operations: [
			{
				method: 'SKIP_REVIEW'
			},
			{
				method: 'POST'
			},
			{
				method: 'PUT'
			},
			{
				method: 'DELETE'
			},
		],
		description: 'This role entitles an authorized user to create, update or delete a record without any approval'
	};
};
module.exports = e;
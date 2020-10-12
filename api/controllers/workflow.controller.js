let e = {};
let mongoose = require('mongoose');
let logger = global.logger;

function getApproverRolesList(entities, app) {
	return mongoose.model('roles').find({ entity: { $in: entities.split(',') }, app: app })
		.then(_doc => {
			if (_doc.length) {
				let perm = [];
				_doc.forEach(document => {
					if (document) {
						document.roles.forEach(_rs => {
							if (_rs.operations) {
								let flag = _rs.operations.some(_o => _o.method && _o.method === 'REVIEW');
								if (flag) perm.push(_rs.id);
							}
						});
					}
				});
				return perm;
			} else {
				return null;
			}
		});
}

function getUsersList(roles) {
	return mongoose.model('group').find({ 'roles.id': { $in: roles } })
		.then(_grps => {
			let usersArr = _grps.map(_grp => _grp.users);
			return [].concat.apply([], usersArr);
		});
}

e.getApproversList = function (req, res) {
	let entity = req.swagger.params.entity.value;
	let app = req.swagger.params.app.value;
	return getApproverRolesList(entity, app)
		.then(_rList => {
			if (_rList) {
				return getUsersList(_rList);
			} else {
				res.status(404).json([]);
			}
		})
		.then(_users => {
			if (_users) {
				res.json({ 'approvers': _users });
			} else {
				if (!res.headersSent)
					res.status(200).json([]);
			}
		})
		.catch(err => {
			logger.error(err.message);
			res.status(500).json({ message: err.message });
		});
};

module.exports = e;
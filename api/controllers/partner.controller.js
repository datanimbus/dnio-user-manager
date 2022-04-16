let mongoose = require('mongoose');
const logger = global.logger;
let pmRole = require('../../config/roles').find(_r => _r.entity === 'PM');
let nsRole = require('../../config/roles').find(_r => _r.entity === 'NS');
let e = {};

e.destroy = function (req, res) {
	let id = req.params.id;
	res.json({ message: 'delete process queued' });
	return mongoose.model('roles').findOne({ 'entity': 'PM_' + id })
		.then(doc => {
			if (doc) {
				return doc.remove(req);
			}
		})
		.then(_d => {
			logger.info('Removed ' + _d._id);
			logger.debug(_d);
			return mongoose.model('group').find({ '$or': [{ 'roles.entity': id }, { 'roles.entity': 'PM_' + id }] });
		})
		.then(docs => {
			return docs.reduce((_pr, cur) => {
				return _pr
					.then(() => {
						cur.roles = cur.roles.filter(value => {
							if (value.entity == id || value.entity == 'PM_' + id) {
								return false;
							}
							else return true;
						});
						cur.markModified('roles');
						cur.save(req);
					});
			}, Promise.resolve());
		})
		.catch(err => {
			logger.error(err.message);
		});
};

e.create = function (req, res) {
	let id = req.params.id;
	let newpmRole = JSON.parse(JSON.stringify(pmRole));
	newpmRole.entity = 'PM_' + id;
	newpmRole.entityName = 'PM_' + req.body.name;
	newpmRole.app = req.body.app;
	newpmRole.fields = JSON.stringify(newpmRole.fields);
	let model = mongoose.model('roles');
	let docModel = new model(newpmRole);
	return model.findOne({ entity: newpmRole.entity })
		.then(_d => {
			if (_d) throw new Error('Partner role already exist');
			return docModel.save(req);
		})
		.then((_d) => {
			logger.debug(_d);
			res.json({ 'message': id + ' Role created' });
		})
		.catch(err => {
			logger.error(err);
			res.status(500).json({ message: err.message });
		});
};

e.destroyFlow = function (req, res) {
	let id = req.params.id;
	res.json({ message: 'delete process queued' });
	return mongoose.model('group').find({ '$or': [{ 'roles.entity': id }, { 'roles.entity': 'FLOW_' + id }, { 'roles.entity': 'INTR_' + id }] })
		.then(docs => {
			return docs.reduce((_pr, cur) => {
				return _pr
					.then(() => {
						cur.roles = cur.roles.filter(value => {
							if (value.entity == 'FLOW_' + id || value.entity == 'INTR_' + id) {
								return false;
							}
							else return true;
						});
						cur.markModified('roles');
						cur.save(req);
					});
			}, Promise.resolve());
		})
		.catch(err => {
			logger.error(err.message);
		});
};

e.destroyDF = function (req, res) {
	let id = req.params.id;
	res.json({ message: 'delete process queued' });
	return mongoose.model('group').find({ '$or': [{ 'roles.entity': id }, { 'roles.entity': 'DF_' + id }] })
		.then(docs => {
			return docs.reduce((_pr, cur) => {
				return _pr
					.then(() => {
						cur.roles = cur.roles.filter(value => {
							if (value.entity == 'DF_' + id) {
								return false;
							}
							else return true;
						});
						cur.markModified('roles');
						cur.save(req);
					});
			}, Promise.resolve());
		})
		.catch(err => {
			logger.error(err.message);
		});
};

e.destroyNS = function (req, res) {
	let id = req.params.id;
	res.json({ message: 'delete process queued' });
	return mongoose.model('group').find({ '$or': [{ 'roles.entity': id }, { 'roles.entity': 'NS_' + id }] })
		.then(docs => {
			return docs.reduce((_pr, cur) => {
				return _pr
					.then(() => {
						cur.roles = cur.roles.filter(value => {
							if (value.entity == 'NS_' + id) {
								return false;
							}
							else return true;
						});
						cur.markModified('roles');
						cur.save(req);
					});
			}, Promise.resolve());
		})
		.then(()=>{
			return mongoose.model('roles').findOne({ 'entity': 'NS_' + id });
		})
		.then(doc => {
			if (doc) {
				return doc.remove(req);
			}
		})
		.catch(err => {
			logger.error(err.message);
		});
};

e.CreateNs = function (req, res) {
	let id = req.params.id;
	let newnsRole = JSON.parse(JSON.stringify(nsRole));
	newnsRole.entity = 'NS_' + id;
	newnsRole.entityName = 'NS_' + req.body.name;
	newnsRole.app = req.body.app;
	newnsRole.fields = JSON.stringify(newnsRole.fields);
	let model = mongoose.model('roles');
	let docModel = new model(newnsRole);
	return model.findOne({ entity: newnsRole.entity })
		.then(_d => {
			if (_d) throw new Error('Nano Service already exist');
			return docModel.save(req);
		})
		.then((_d) => {
			logger.debug(_d);
			res.json({ 'message': id + ' Role created' });
		})
		.catch(err => {
			logger.error(err);
			res.status(500).json({ message: err.message });
		});
};



module.exports = e;
let mongoose = require('mongoose');
const logger = global.logger;
let smRole = require('../../config/roles').find(_r => _r.entity === 'SM');
let gsRole = require('../../config/roles').find(_r => _r.entity === 'GS');
let e = {};

e.destroy = function (req, res) {
	let id = req.swagger.params.id.value;
	res.json({ message: 'delete process queued' });
	mongoose.model('roles').findOne({ '_id': id })
		.then(doc => {
			if (doc) {
				return doc.remove(req);
			}
		})
		.then(doc => {
			if (doc) logger.info(`[${req.get('TxnId')}] Service role removed :  ${doc._id}`);
			logger.trace(`[${req.get('TxnId')}] ${JSON.stringify(doc)}`);
			return mongoose.model('preference').find({ 'type': { '$in': ['column'] }, 'key': id });
		})
		.then(docs => {
			if (docs) {
				return Promise.all(docs.map(_d => _d.remove(req)));
			}
		})
		.then(docs => {
			if (docs) {
				logger.info('Removed ' + docs.map(_d => _d._id) + ' preferences');
			}
			return mongoose.model('roles').findOne({ 'entity': 'SM_' + id });
		})
		.then(_d => {
			if (_d) return _d.remove(req);
		})
		.then(_d=>{
			logger.info(`[${req.get('TxnId')}] Removed : ${_d._id}`);
			logger.trace(`[${req.get('TxnId')}] ${JSON.stringify(_d)}`);
		})
		.then(()=>{
			return mongoose.model('userMgmt.filter').find({'serviceId': id });
		})
		.then(docs => {
			if (docs) {
				return Promise.all(docs.map(_d => _d.remove(req)));
			}
		})
		.then(()=>{
			return mongoose.model('group').find({'$or': [{'roles.entity': id}, {'roles.entity': 'SM_'+id}]});
		})
		.then(docs=>{
			return docs.reduce((_pr, cur, i) => {
				return _pr
					.then(()=>{
						cur.roles = cur.roles.filter(function isException(value) { 
							if (value.entity == id ||value.entity == 'SM_'+id){
								return false;
							} 
							else return true;
						} );
						docs[i].roles = cur.roles;
						cur.save(req);
					});
			},Promise.resolve());
		})
		.catch(err => {
			logger.error(err.message);
		});
};


e.create = function (req, res) {
	let id = req.swagger.params.id.value;
	let newsmRole = JSON.parse(JSON.stringify(smRole));
	newsmRole.entity = 'SM_' + id;
	newsmRole.entityName = 'SM_' + req.body.name;
	newsmRole.app = req.body.app;
	newsmRole.fields = JSON.stringify(newsmRole.fields);
	let model = mongoose.model('roles');
	let docModel = new model(newsmRole);
	return docModel.save(req)
		.then((_d) => {
			logger.info(`[${req.get('TxnId')}] Service role created`);
			logger.trace(`${JSON.stringify(_d)}`);
			res.json({ 'message': 'Role created' });
		})
		.catch(err => {
			logger.error(err);
			res.status(500).json({ message: err.message });
		});
};

e.createLibrary = function (req, res) {
	let id = req.swagger.params.id.value;
	let newgsRole = JSON.parse(JSON.stringify(gsRole));
	newgsRole.entity = 'GS_' + id;
	newgsRole.entityName = 'GS_' + id;
	newgsRole.app = req.body.app;
	newgsRole.fields = JSON.stringify(newgsRole.fields);
	let model = mongoose.model('roles');
	let docModel = new model(newgsRole);
	return docModel.save(req)
		.then((_d) => {
			logger.info(`[${req.get('TxnId')}] Library role created`);
			logger.trace(`${JSON.stringify(_d)}`);
			res.json({ 'message': 'Role created' });
		})
		.catch(err => {
			logger.error(err);
			res.status(500).json({ message: err.message });
		});
};

e.deleteLibrary = function(req, res){
	let id = req.swagger.params.id.value;
	return mongoose.model('roles').findOne({ 'entity': 'GS_' + id })
		.then(_d => {
			if (_d) return _d.remove(req);
		})
		.then(_d=>{
			logger.info(`[${req.get('TxnId')}] Library role deleted :: ${id}`);
			logger.trace(`${JSON.stringify(_d)}`);
			res.json({ 'message': 'Roles deleted' });
		})
		.catch(err => {
			logger.error(err.message);
			res.status(500).json({ message: err.message });
		});
};

module.exports = e;
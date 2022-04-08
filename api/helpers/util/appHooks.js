
const request = require('request');
const config = require('../../../config/config');
const mongoose = require('mongoose');
let logger = global.logger;
let e = {};

e.sendRequest = (url, method, qs, body, _req) => {
	if (_req && !_req.headers) {
		const headers = {};
		const headersLen = _req.rawHeaders.length;
		for (let index = 0; index < headersLen; index += 2) {
			headers[_req.rawHeaders[index]] = _req.rawHeaders[index + 1];
		}
		_req.headers = headers;
	}
	var options = {
		url: url,
		method: method,
		headers: {
			'Content-Type': 'application/json',
			'TxnId': _req && _req.headers ? _req.headers['txnId'] : null,
			'User': _req && _req.headers ? _req.headers['user'] : null,
			'Authorization': `JWT ${global.USER_TOKEN}`
		},
		json: true
	};
	if (body) {
		options.json = true;
		options.body = body;
	}
	if (qs) {
		options.qs = qs;
	}
	logger.debug(`Options for request : ${JSON.stringify(options)}`);
	return new Promise((resolve, reject) => {
		request[method.toLowerCase()](options, function (err, res, body) {
			if (err) {
				logger.error(err.message);
				reject(err);
			} else if (!res) {
				logger.error('Server is DOWN');
				reject(new Error('Server is down'));
			}
			else {
				if (res.statusCode >= 200 && res.statusCode < 400) {
					resolve(body);
				} else {
					logger.debug(res.statusCode);
					logger.debug(body);
					reject(new Error('Request returned ' + res.statusCode));
				}
			}
		});
	});
};

e.getPostRemoveHook = () => {
	return function (doc) {
		e.sendRequest(config.baseUrlSM + '/app/' + doc._id, 'DELETE', null, null, doc._req)
			.then(() => {
				return mongoose.model('user').find({ $or: [{ 'accessControl.accessLevel': 'Selected', 'accessControl.apps._id': doc._id }, { 'roles.app': doc._id }] });
			})
			.then(docs => {
				let promises = docs.map(_d => {
					_d.accessControl.apps = _d.accessControl.apps ? _d.accessControl.apps.filter(_ob => _ob._id != doc._id) : _d.accessControl.apps;
					_d.markModified('accessControl.apps');
					if (_d.roles) {
						_d.roles = _d.roles ? _d.roles.filter(_r => _r.app != doc._id) : _d.roles;
						_d.markModified('roles');
					}
					return _d.save(doc._req);
				});
				return Promise.all(promises);
			})
			.then(() => mongoose.model('roles').find({ 'app': doc._id }, '_id'))
			.then(docs => {
				if (docs) {
					return Promise.all(docs.map(_d => _d.remove(doc._req)));
				}
			})
			.then(docs => {
				logger.debug(docs);
				return e.sendRequest(config.baseUrlPM + '/app/' + doc._id, 'DELETE', null, null, doc._req);
			})
			.then(_d => logger.debug(_d))
			.catch(err => {
				logger.error(err);
			});
	};
};

e.preRemovePMFlows = function () {
	return function (next, req) {
		let self = this;
		let url = config.baseUrlPM + '/flow';
		return e.sendRequest(url, 'GET', { select: '_id', filter: JSON.stringify({ app: self._id }) }, null, req)
			.then(_body => {
				if (_body.length === 0) next();
				else {
					logger.debug(JSON.stringify(_body));
					next(new Error('Flows exist for this app.'));
				}
			})
			.catch(err => next(err));
	};

};

e.preRemovePMFaas = function () {
	return function (next, req) {
		let self = this;
		let url = config.baseUrlPM + '/' + self._id + '/faas';
		let qs = { filter: { status: { $eq: 'Active' }, 'app': self._id }, select: 'name' };
		
		return e.sendRequest(url, 'GET', qs, null, req)
			.then(_body => {
				if (_body.length === 0) next();
				else {
					logger.debug(JSON.stringify(_body));
					next(new Error( _body.map(_b => _b.name) + ' functions are running. Please stop them before deleting app.' ));
				}
			})
			.catch(err => next(err));
	};

};

module.exports = e;
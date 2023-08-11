const router = require('express').Router({ mergeParams: true });
const _ = require('lodash');

const kubeUtils = require('../utils/k8s.api.utils');
const config = require('../../config/config');

const logger = global.logger;
const baseURL = '/api/v1';

router.get('/exists', async function create(req, res) {
	try {
		const secretName = _.toLower(req.params.app);
		const namespace = _.toLower(config.dataStackNS + '-' + req.params.app);
		const URL = baseURL + '/namespaces/' + namespace + '/secrets/' + secretName;
		const resp = await kubeUtils.get(URL);
		if (resp.statusCode == 200) {
			res.status(200).json({ exists: true });
		} else {
			res.status(200).json({ exists: false });
		}
	} catch (err) {
		logger.error(err);
		if (err.body) {
			res.status(500).json(err.body);
		} else {
			res.status(500).json({ message: err.message });
		}
	}
});

router.get('/', async function create(req, res) {
	try {
		const secretName = _.toLower(req.params.app);
		const namespace = _.toLower(config.dataStackNS + '-' + req.params.app);
		const URL = baseURL + '/namespaces/' + namespace + '/secrets/' + secretName;
		const resp = await kubeUtils.get(URL);
		if (resp.statusCode == 200) {
			let jsonData = resp.body.data;
			let data = _.map(jsonData, (value, key) => {
				const t = {};
				t.key = key;
				t.value = value;
				return t;
			});
			res.status(resp.statusCode).json(data);
		} else {
			res.status(resp.statusCode).json({ message: resp.body.message });
		}
	} catch (err) {
		logger.error(err);
		if (err.body) {
			res.status(500).json(err.body);
		} else {
			res.status(500).json({ message: err.message });
		}
	}
});

router.put('/', async function show(req, res) {
	try {
		const secretName = _.toLower(req.params.app);
		const namespace = _.toLower(config.dataStackNS + '-' + req.params.app);
		const URL = baseURL + '/namespaces/' + namespace + '/secrets/' + secretName;
		const payload = {
			apiVersion: 'v1',
			kind: 'Secret',
			metadata: {
				name: secretName
			},
			type: 'Opaque',
			data: {}
		};
		if (!req.body) {
			req.body = [];
		}
		req.body.forEach((item) => {
			let formattedKey = _.toLower(_.snakeCase(item.key));
			let formattedValue = Buffer.from(item.value).toString('base64');
			payload.data[formattedKey] = formattedValue;
		});
		const resp = await kubeUtils.put(URL, payload);
		if (resp.statusCode == 200) {
			let jsonData = resp.body.data;
			let data = _.map(jsonData, (value, key) => {
				const t = {};
				t.key = key;
				t.value = value;
				return t;
			});
			res.status(resp.statusCode).json(data);
		} else {
			res.status(resp.statusCode).json({ message: resp.body.message });
		}
	} catch (err) {
		logger.error(err);
		if (err.body) {
			res.status(500).json(err.body);
		} else {
			res.status(500).json({ message: err.message });
		}
	}
});
router.post('/', async function update(req, res) {
	try {
		const secretName = _.toLower(req.params.app);
		const namespace = _.toLower(config.dataStackNS + '-' + req.params.app);
		const URL = baseURL + '/namespaces/' + namespace + '/secrets';
		const payload = {
			apiVersion: 'v1',
			kind: 'Secret',
			metadata: {
				name: secretName
			},
			type: 'Opaque',
			data: {}
		};
		if (!req.body) {
			req.body = [];
		}
		req.body.forEach((item) => {
			let formattedKey = _.toLower(_.snakeCase(item.key));
			let formattedValue = Buffer.from(item.value).toString('base64');
			payload.data[formattedKey] = formattedValue;
		});
		const resp = await kubeUtils.post(URL, payload);
		if (resp.statusCode == 200) {
			let jsonData = resp.body.data;
			let data = _.map(jsonData, (value, key) => {
				const t = {};
				t.key = key;
				t.value = value;
				return t;
			});
			res.status(resp.statusCode).json(data);
		} else {
			res.status(resp.statusCode).json({ message: resp.body.message });
		}
	} catch (err) {
		logger.error(err);
		if (err.body) {
			res.status(500).json(err.body);
		} else {
			res.status(500).json({ message: err.message });
		}
	}
});

// router.delete('/', async function destroy(req, res) {
// 	try {
// 		const secretName = _.toLower(req.params.app);
// 		const namespace = _.toLower(config.dataStackNS + '-' + req.params.app);
// 		const URL = baseURL + '/namespaces/' + namespace + '/secrets/' + secretName;
// 		const resp = await kubeUtils.delete(URL, {});
// 		if (resp.statusCode == 200) {
// 			res.status(resp.statusCode).json({ message: 'Secret Deleted' });
// 		} else {
// 			res.status(resp.statusCode).json({ message: resp.body.message });
// 		}
// 	} catch (err) {
// 		logger.error(err);
// 		if (err.body) {
// 			res.status(500).json(err.body);
// 		} else {
// 			res.status(500).json({ message: err.message });
// 		}
// 	}
// });


module.exports = router;
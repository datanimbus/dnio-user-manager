const fs = require('fs');
const got = require('got');

const URL = 'https://kubernetes.default.svc';
const e = {};

let dataStackToken = process.env.K8S_API_TOKEN || '';
let dataStackTokenInPath = '/var/run/secrets/kubernetes.io/serviceaccount/token';
if (fs.existsSync(dataStackTokenInPath)) dataStackToken = fs.readFileSync(dataStackTokenInPath);

e.get = async (path) => {
	const options = {
		method: 'GET',
		url: URL + path,
		throwHttpErrors: false,
		https: {
			rejectUnauthorized: false
		},
		responseType: 'json',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + dataStackToken
		},
	};
	try {
		const resp = await got(options);
		return { statusCode: resp.statusCode, body: resp.body };
	} catch (err) {
		if (err.response) {
			throw { statusCode: err.response.statusCode, body: err.response.body };
		} else {
			throw { statusCode: 500, body: err };
		}
	}
};

e.post = async (path, payload) => {
	const options = {
		method: 'POST',
		url: URL + path,
		throwHttpErrors: false,
		https: {
			rejectUnauthorized: false
		},
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + dataStackToken
		},
		responseType: 'json',
		json: payload,
	};
	try {
		const resp = await got(options);
		return { statusCode: resp.statusCode, body: resp.body };
	} catch (err) {
		if (err.response) {
			throw { statusCode: err.response.statusCode, body: err.response.body };
		} else {
			throw { statusCode: 500, body: err };
		}
	}
};

e.patch = async (path, payload) => {
	const options = {
		method: 'PATCH',
		url: URL + path,
		throwHttpErrors: false,
		https: {
			rejectUnauthorized: false
		},
		headers: {
			'Authorization': 'Bearer ' + dataStackToken,
			'Content-Type': 'application/merge-patch+json'
		},
		responseType: 'json',
		json: payload
	};
	try {
		const resp = await got(options);
		return { statusCode: resp.statusCode, body: resp.body };
	} catch (err) {
		if (err.response) {
			throw { statusCode: err.response.statusCode, body: err.response.body };
		} else {
			throw { statusCode: 500, body: err };
		}
	}
};

e.delete = async (path, payload) => {
	const options = {
		method: 'DELETE',
		url: URL + path,
		throwHttpErrors: false,
		https: {
			rejectUnauthorized: false
		},
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + dataStackToken
		},
		responseType: 'json',
		json: payload
	};
	try {
		const resp = await got(options);
		return { statusCode: resp.statusCode, body: resp.body };
	} catch (err) {
		if (err.response) {
			throw { statusCode: err.response.statusCode, body: err.response.body };
		} else {
			throw { statusCode: 500, body: err };
		}
	}
};

e.put = async (path, payload) => {
	const options = {
		method: 'PUT',
		url: URL + path,
		throwHttpErrors: false,
		https: {
			rejectUnauthorized: false
		},
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + dataStackToken
		},
		responseType: 'json',
		json: payload
	};
	try {
		const resp = await got(options);
		return { statusCode: resp.statusCode, body: resp.body };
	} catch (err) {
		if (err.response) {
			throw { statusCode: err.response.statusCode, body: err.response.body };
		} else {
			throw { statusCode: 500, body: err };
		}
	}
};

module.exports = e;
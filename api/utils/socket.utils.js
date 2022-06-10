const got = require('got');

const config = require('../../config/config');

async function sendToSocket(event, data) {
	const resp = await got({
		url: config.baseUrlGW + '/api/a/gw/socket-emit',
		method: 'post',
		json: {
			event,
			data
		},
		responseType: 'json',
		headers: {
			'Content-Type': 'application/json'
		}
	});
	return resp;
}


module.exports.sendToSocket = sendToSocket;
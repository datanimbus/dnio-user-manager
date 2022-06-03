const { workerData, parentPort } = require('worker_threads');
const { parseFile } = require('fast-csv');
const config = require('../../config/config');


const filePath = workerData.filePath;
const fileId = workerData.fileId;
const app = workerData.app;
const users = [];

parseFile(filePath, { headers: false, skipRows: 1 }).on('error', (err) => {
	parentPort.postMessage({
		statusCode: 400,
		error: err,
		message: err.message
	});
	parentPort.close();
}).on('data', async (row) => {
	const user = {
		name: row[0] ? row[0].trim() : null,
		username: row[1] ? row[1].trim() : null,
		password: row[2] ? row[2].trim() : null,
		authType: row[3] || config.RBAC_USER_AUTH_MODES[0]
	};
	const data = {
		fileId,
		data: user,
		app,
		status: 'Pending',
		_metadata: {
			version: {
				document: 1
			},
			deleted: false,
			lastUpdated: new Date(),
			createdAt: new Date()
		}
	};
	users.push(data);
}).on('end', async () => {
	parentPort.postMessage({
		statusCode: 200,
		data: users
	});
});
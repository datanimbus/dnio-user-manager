var mongoose = require('mongoose');
const logger = global.logger;

async function getMongoDbVersion() {
	try {
		let mongoDbVersion = (await mongoose.connection.db.admin().serverInfo()).version;
		logger.info('Running mongoDb version - ', mongoDbVersion);
		return mongoDbVersion;
	} catch(err) {
		logger.info('Failed to get mongoDb version', err);
		return;
	}
}

module.exports = {
	getMongoDbVersion: getMongoDbVersion
};

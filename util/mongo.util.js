const logger = global.logger;

async function getMongoDbVersion() {
	try {
		let mongoDbVersion = (await global.mongoConnection.db('test').admin().serverInfo()).version;
		logger.info(`Appcenter MongoDB version - ${mongoDbVersion}`);
		return mongoDbVersion;
	} catch (err) {
		logger.error('Failed to get MongoDB version', err);
		return '0.0.0';
	}
}
module.exports = {
	getMongoDbVersion: getMongoDbVersion
};
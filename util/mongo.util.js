const logger = global.logger;

async function getMongoDbVersion() {
	try {
		if (global.mongoDbVersion) return Promise.resolve(global.mongoDbVersion);
		let mongoDbVersion = (await global.mongoConnection.db().admin().serverInfo()).version;
		logger.info(`Appcenter MongoDB version - ${mongoDbVersion}`);
		global.mongoDbVersion = mongoDbVersion;
		return mongoDbVersion;
	} catch (err) {
		logger.error('Failed to get MongoDB version', err);
		return '0.0.0';
	}
}

async function setIsTransactionAllowed() {
	try {
		global.isTransactionAllowed = false;
		let replicaSetStatus = await global.mongoConnection.db().admin().command({ "replSetGetStatus": 1 });
		logger.trace('Appcenter Replica Status :: ', replicaSetStatus);
		if (replicaSetStatus) {
			let mongoDbVersion = await getMongoDbVersion();
			global.isTransactionAllowed = mongoDbVersion && mongoDbVersion  >= '4.2.0';
		}
		logger.info('Are MongoDb Transactions Allowed :: ', global.isTransactionAllowed);
	} catch (err) {
		logger.error('Failed to get MongoDB version', err);
	}
}
module.exports = {
	getMongoDbVersion: getMongoDbVersion,
	setIsTransactionAllowed: setIsTransactionAllowed
};
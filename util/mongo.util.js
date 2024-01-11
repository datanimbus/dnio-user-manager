const logger = global.logger;

async function getMongoDbVersion() {
	try {
		if (global.mongoDbVersion) return Promise.resolve(global.mongoDbVersion);
		let mongoDbVersion = (await global.mongoConnection.db.admin().serverInfo()).version;
		logger.info(`Appcenter MongoDB version - ${mongoDbVersion}`);
		global.mongoDbVersion = mongoDbVersion;
		return mongoDbVersion;
	} catch (err) {
		logger.error('Failed to get MongoDB version', err);
		return '0.0.0';
	}
}

async function getAppcenterDbVersion() {
	try {
		if (global.AppcenterDbVersion) return Promise.resolve(global.AppcenterDbVersion);
	
		let AppcenterDbVersion = (await global.dbAppcenterConnection.db.admin().serverInfo()).version;

		logger.info(`Appcenter DB version - ${AppcenterDbVersion}`);
	
		global.AppcenterDbVersion = AppcenterDbVersion;
		return AppcenterDbVersion;
	} catch (err) {
		logger.error('Failed to get Appcenter DB version', err);
		return '0.0.0';
	}
}

async function setIsTransactionAllowed() {
	try {
		global.isTransactionAllowed = false;
		// let replicaSetStatus = await global.mongoConnection.db.admin().command({ 'replSetGetStatus': 1 });
		let replicaSetStatus = await global.dbAppcenterConnection.db.admin().command({ 'replSetGetStatus': 1 });
		logger.trace('Appcenter Replica Status :: ', replicaSetStatus);
		if (replicaSetStatus) {
			// let mongoDbVersion = await getMongoDbVersion();
			let AppcenterDbVersion = await getAppcenterDbVersion();
			global.isTransactionAllowed = AppcenterDbVersion && AppcenterDbVersion  >= '4.2.0';
		}
	} catch (err) {
		logger.error('Error in setIsTransactionAllowed :: ', err.message);
	} finally {
		logger.info('Are Appcenter DB Transactions Allowed :: ', global.isTransactionAllowed);
	}
}
module.exports = {
	getMongoDbVersion: getMongoDbVersion,
	getAppcenterDbVersion: getAppcenterDbVersion,
	setIsTransactionAllowed: setIsTransactionAllowed
};
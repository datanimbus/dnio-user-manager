'use strict';
if (process.env.NODE_ENV != 'production') {
	require('dotenv').config();
}

const express = require('express');
const app = express();
const utils = require('@appveen/utils');
const log4js = utils.logger.getLogger;

let version = require('./package.json').version;
const loggerName = (process.env.KUBERNETES_SERVICE_HOST && process.env.KUBERNETES_SERVICE_PORT) ? `[${process.env.DATA_STACK_NAMESPACE}] [${process.env.HOSTNAME}] [USER ${version}]` : `[USER ${version}]`;


const logger = log4js.getLogger(loggerName);
const bluebird = require('bluebird');
// const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const passport = require('passport');
var cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
logger.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';

global.Promise = bluebird;
global.logger = logger;
// const authorDB = process.env.MONGO_AUTHOR_DBNAME || 'odpConfig';
const conf = require('./config/config.js');
var mongoUtil = require('./util/mongo.util');
const globalCache = require('./util/cache');
const { fetchEnvironmentVariablesFromDB } = require('./config/config');

logger.info(`RBAC_USER_TO_SINGLE_SESSION :: ${conf.RBAC_USER_TO_SINGLE_SESSION}`);
logger.info(`RBAC_USER_TOKEN_DURATION :: ${conf.RBAC_USER_TOKEN_DURATION}`);
logger.info(`RBAC_BOT_TOKEN_DURATION :: ${conf.RBAC_BOT_TOKEN_DURATION}`);
logger.info(`RBAC_USER_TOKEN_REFRESH :: ${conf.RBAC_USER_TOKEN_REFRESH}`);
logger.info(`RBAC_USER_CLOSE_WINDOW_TO_LOGOUT :: ${conf.RBAC_USER_CLOSE_WINDOW_TO_LOGOUT}`);
logger.info(`RBAC_HB_INTERVAL :: ${conf.RBAC_HB_INTERVAL}`);
logger.info(`RBAC_USER_RELOGIN_ACTION :: ${conf.RBAC_USER_RELOGIN_ACTION}`);
logger.info(`PRIVATE_FILTER :: ${conf.PRIVATE_FILTER}`);
logger.info(`data.stack Default Timezone :: ${conf.dataStackDefaultTimezone}`);
const cacheUtil = utils.cache;

mongoose.Promise = global.Promise;

let maxJSONSize;
let timeOut;
// let mongoUrl = process.env.MONGO_AUTHOR_URL || 'mongodb://localhost';

// logger.debug('Mongo Author URL', mongoUrl);
// logger.debug('Mongo Author Options', conf.mongoOptions);
logger.debug('DB Author Type', conf.dbAuthorType);
logger.debug('DB Author URL', conf.dbAuthorUrl);
logger.debug('DB Author Options', conf.dbAuthorOptions);


// var MongoClient = require('mongodb').MongoClient;
(async () => {
	try {
		// const client = new MongoClient(conf.dbAuthorUrl);
		// let dbAuthorConnection = await client.connect();

		// var server = tunnel(config, function (error, server) {
		// 	if(error){
		// 		console.log("SSH connection error: " + error);
		// 	}
		// 	mongoose.connect('mongodb://localhost:27000/');
		// 	//...rest of mongoose connection
		// }

		// await mongoose.connect(mongoUrl, conf.mongoOptions);
		await mongoose.connect(conf.dbAuthorUrl, conf.dbAuthorOptions);
		mongoose.connection.on('connecting', () => logger.info(' *** Author DB :: Connecting'));
		mongoose.connection.on('disconnected', () => logger.error(' *** Author DB :: connection lost'));
		mongoose.connection.on('reconnect', () => logger.info(' *** Author DB :: Reconnected'));
		mongoose.connection.on('reconnectFailed', () => logger.error(' *** Author DB :: Reconnect attempt failed'));
		logger.info('Connected to Author DB');
		logger.trace(`Connected to URL: ${mongoose.connection.host}`);
		logger.trace(`Connected to DB:${mongoose.connection.name}`);
		logger.trace(`Connected via User: ${mongoose.connection.user}`);

		// logger.info('Mongo Appcenter URL', conf.mongoUrlAppcenter);
		// logger.debug('Mongo Appcenter Options', conf.mongoAppcenterOptions);
		// await mongoose.createConnection(conf.mongoUrlAppcenter, conf.mongoAppcenterOptions);

		logger.info('DB Appcenter Type', conf.dbAppcenterType);
		logger.info('DB Appcenter URL', conf.dbAppcenterUrl);
		logger.debug('DB Appcenter Options', conf.dbAppcenterOptions);
		await mongoose.createConnection(conf.dbAppcenterUrl, conf.dbAppcenterOptions);

		global.mongoConnection = mongoose.connections[1];
		global.dbAuthorConnection = mongoose.connections[0];
		global.dbAppcenterConnection = mongoose.connections[1];
		logger.info('Connected to Appcenter DB');
		await mongoUtil.setIsTransactionAllowed();

		// After MongoDB is connected, fetch environment variables
		const envVariables = await fetchEnvironmentVariablesFromDB();
		timeOut = envVariables.API_REQUEST_TIMEOUT || 120;
		maxJSONSize = envVariables.MAX_JSON_SIZE || '100kb';
		logger.info(`Max request JSON size :: ${maxJSONSize}`);
		logger.info(`DS_FUZZY_SEARCH :: ${envVariables.DS_FUZZY_SEARCH}`);
		logger.info(`Max request file upload size :: ${envVariables.MAX_FILE_SIZE || '5MB'}`);
		require('./config/passport')(passport);
		initialize();
	} catch (err) {
		logger.error(err);
	}
})();

function initialize() {
	app.use(express.json({
		inflate: true,
		limit: maxJSONSize,
		strict: true
	}));
	app.use(cookieParser());

	cacheUtil.init();
	globalCache.init();

	var logMiddleware = utils.logMiddleware.getLogMiddleware(logger);
	app.use(logMiddleware);

	app.use(passport.initialize());
	app.use(require('./util/auth'));
	app.use(fileUpload({ useTempFiles: true, tempFileDir: './tmp/files' }));

	let dataStackUtils = require('@appveen/data.stack-utils');
	let queueMgmt = require('./util/queueMgmt');

	dataStackUtils.eventsUtil.setNatsClient(queueMgmt.client);
	app.use(dataStackUtils.logToQueue('user', queueMgmt.client, conf.logQueueName, 'user.logs'));

	app.use('/rbac', require('./api/controllers/controller'));

	app.use(function (error, req, res, next) {
		if (error) {
			logger.error(error);
			if (!res.headersSent) {
				let statusCode = error.statusCode || 500;
				if (error.message.includes('APP_NAME_ERROR')) {
					statusCode = 400;
				}
				res.status(statusCode).json({
					message: error.message
				});
			}
		} else {
			next();
		}
	});

	const port = process.env.PORT || 10004;
	const server = app.listen(port, (err) => {
		if (!err) {
			logger.info('Server started on port ' + port);
			app.use((err, req, res, next) => {
				if (err) {
					if (!res.headersSent)
						return res.status(500).json({ message: err.message });
					return;
				}
				next();
			});
		} else
			logger.error(err);
	});
	server.setTimeout(parseInt(timeOut) * 1000);
}

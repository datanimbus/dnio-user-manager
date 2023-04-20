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
let timeOut = process.env.API_REQUEST_TIMEOUT || 120;

global.Promise = bluebird;
global.logger = logger;
// const authorDB = process.env.MONGO_AUTHOR_DBNAME || 'odpConfig';
const conf = require('./config/config.js');
var mongoUtil = require('./util/mongo.util');
const globalCache = require('./util/cache');

logger.info(`RBAC_USER_TO_SINGLE_SESSION :: ${conf.RBAC_USER_TO_SINGLE_SESSION}`);
logger.info(`RBAC_USER_TOKEN_DURATION :: ${conf.RBAC_USER_TOKEN_DURATION}`);
logger.info(`RBAC_BOT_TOKEN_DURATION :: ${conf.RBAC_BOT_TOKEN_DURATION}`);
logger.info(`RBAC_USER_TOKEN_REFRESH :: ${conf.RBAC_USER_TOKEN_REFRESH}`);
logger.info(`RBAC_USER_CLOSE_WINDOW_TO_LOGOUT :: ${conf.RBAC_USER_CLOSE_WINDOW_TO_LOGOUT}`);
logger.info(`RBAC_HB_INTERVAL :: ${conf.RBAC_HB_INTERVAL}`);
logger.info(`RBAC_USER_RELOGIN_ACTION :: ${conf.RBAC_USER_RELOGIN_ACTION}`);
logger.info(`PRIVATE_FILTER :: ${conf.PRIVATE_FILTER}`);
logger.info(`DS_FUZZY_SEARCH :: ${conf.DS_FUZZY_SEARCH}`);
logger.info(`data.stack Default Timezone :: ${conf.dataStackDefaultTimezone}`);
const cacheUtil = utils.cache;

mongoose.Promise = global.Promise;

let maxJSONSize = process.env.MAX_JSON_SIZE || '100kb';
logger.info(`Max request JSON size :: ${maxJSONSize}`);

let maxFileSize = process.env.MAX_FILE_SIZE || '5MB';
logger.info(`Max request file upload size :: ${maxFileSize}`);

app.use(express.json({
	inflate: true,
	limit: maxJSONSize,
	strict: true
}));
app.use(cookieParser());

// if (conf.debugDB) mongoose.set('debug', conf.mongooseCustomLogger);
// if (conf.debugDB) Logger.setLevel('debug');

let mongoUrl = process.env.MONGO_AUTHOR_URL || 'mongodb://localhost';

logger.debug('Mongo Author URL', mongoUrl);
logger.debug('Mongo Author Options', conf.mongoOptions);

// mongoose.connect(mongoUrl, conf.mongoOptions, (err) => {
// 	if (err) {
// 		logger.error(err);
// 	} else {
// 		logger.info('Connected to Author DB');
// 		logger.trace(`Connected to URL: ${mongoose.connection.host}`);
// 		logger.trace(`Connected to DB:${mongoose.connection.name}`);
// 		logger.trace(`Connected via User: ${mongoose.connection.user}`);
// 	}
// });
(async () => {
	try {
		await mongoose.connect(mongoUrl, conf.mongoOptions);
		logger.info('Connected to Author DB');
		logger.trace(`Connected to URL: ${mongoose.connection.host}`);
		logger.trace(`Connected to DB:${mongoose.connection.name}`);
		logger.trace(`Connected via User: ${mongoose.connection.user}`);
		logger.info('Mongo Appcenter URL', conf.mongoUrlAppcenter);
		logger.debug('Mongo Appcenter Options', conf.mongoAppcenterOptions);
		await mongoose.createConnection(conf.mongoUrlAppcenter, conf.mongoAppcenterOptions);
		global.mongoConnection = mongoose.connections[1];
		logger.info('Connected to Appcenter DB');
		await mongoUtil.setIsTransactionAllowed();
	} catch (err) {
		logger.error(err);
	}
})();




// MongoClient.connect(conf.mongoUrlAppcenter, conf.mongoAppcenterOptions, async (error, db) => {
// 	if (error) logger.error(error.message);
// 	if (db) {
// 		global.mongoConnection = db;
// 		logger.info('Connected to Appcenter DB');
// 		await mongoUtil.setIsTransactionAllowed();
// 	}
// });

cacheUtil.init();
globalCache.init();

mongoose.connection.on('connecting', () => logger.info(' *** Author DB :: Connecting'));
mongoose.connection.on('disconnected', () => logger.error(' *** Author DB :: connection lost'));
mongoose.connection.on('reconnect', () => logger.info(' *** Author DB :: Reconnected'));
mongoose.connection.on('reconnectFailed', () => logger.error(' *** Author DB :: Reconnect attempt failed'));

var logMiddleware = utils.logMiddleware.getLogMiddleware(logger);
app.use(logMiddleware);

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(require('./util/auth'));
app.use(fileUpload({ useTempFiles: true, tempFileDir: './tmp/files' }));

let dataStackUtils = require('@appveen/data.stack-utils');
let queueMgmt = require('./util/queueMgmt');
dataStackUtils.eventsUtil.setNatsClient(queueMgmt.client);
app.use(dataStackUtils.logToQueue('user', queueMgmt.client, conf.logQueueName, 'user.logs'));

app.use('/rbac', require('./api/controllers/controller'));

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

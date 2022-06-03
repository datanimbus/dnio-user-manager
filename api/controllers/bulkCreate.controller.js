'use strict';

const fs = require('fs');
const path = require('path');
const router = require('express').Router({ mergeParams: true });
const mongoose = require('mongoose');
const SMCrud = require('@appveen/swagger-mongoose-crud');
const { writeToPath, writeToString } = require('fast-csv');
const FileType = require('file-type/core');
const readChunk = require('read-chunk');
const { Worker } = require('worker_threads');
const _ = require('lodash');


const adUtils = require('../utils/azure.ad.utils');
const config = require('../../config/config');
const cache = require('../../util/cache.utils').cache;

const definition = require('../helpers/userMgmtBulkCreate.definition.js').definition;
const fileTransfersDefinition = require('../helpers/file-transfers.definition').definition;

const schema = new mongoose.Schema(definition, { timestamps: true });
const fileTransfersSchema = new mongoose.Schema(fileTransfersDefinition, { timestamps: true });

schema.index({ '_metadata.createdAt': 1 }, { expireAfterSeconds: 2628000 });
fileTransfersSchema.index({ '_metadata.createdAt': 1 }, { expireAfterSeconds: 2628000 });
const logger = global.logger;

const options = {
	logger: logger,
	collectionName: 'userMgmt.users.bulkCreate'
};

const fileTransfersOptions = {
	logger: logger,
	collectionName: 'userMgmt.users.fileTransfers'
};

const crudder = new SMCrud(schema, 'bulkCreate', options);
const fileTransfersCrudder = new SMCrud(fileTransfersSchema, 'fileTransfers', fileTransfersOptions);

const passwordPattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*?~]).+$/;

function modifyFilterForBulkCreate(req) {
	let filter = req.query.filter;
	let fileId = req.params.fileId;
	if (filter && typeof filter === 'string') {
		filter = JSON.parse(filter);
	}
	if (filter && typeof filter === 'object') {
		filter.fileId = fileId;
		delete filter.app;
	} else {
		filter = {
			fileId
		};
	}
	req.query.filter = JSON.stringify(filter);
}

function modifyFilterForFileTransfers(req) {
	let filter = req.query.filter;
	if (filter && typeof filter === 'string') {
		filter = JSON.parse(filter);
	}
	if (filter && typeof filter === 'object') {
		filter.app = req.params.app;
		filter.user = req.user._id;
	} else {
		filter = {
			app: req.params.app,
			user: req.user._id
		};
	}
	req.query.filter = JSON.stringify(filter);
}

router.get('/:fileId/userList', function (req, res) {
	modifyFilterForBulkCreate(req);
	crudder.index(req, res, {
		resHandler: function (err, resTemp, body, statusCode) {
			if (Array.isArray(body)) {
				return body.map(e => {
					delete e.data.password;
					return e;
				});
			} else if (body) {
				delete body.data.password;
			}
			return body;
		}
	});
});

router.get('/:fileId/count', function (req, res) {
	modifyFilterForBulkCreate(req);
	crudder.count(req, res);
});

router.get('/fileTransfers', function (req, res) {
	modifyFilterForFileTransfers(req);
	if (req.query.countOnly == true) {
		fileTransfersCrudder.count(req, res);
	} else {
		fileTransfersCrudder.index(req, res);
	}
});


router.get('/template', async function (req, res) {
	try {
		const filePath = path.join(process.cwd(), 'data-stack-users-template.csv');
		const templateData = [
			['Name [Required for local Auth Mode]', 'Username [Email]', 'Password [Required for local Auth Mode]', 'Auth Mode [local/azure/ldap]'],
			['John Doe', 'johndoe@datastack.com', 'thisisapassword', 'local'],
		];
		if (req.header('content-type') !== 'application/json') {
			writeToPath(filePath, templateData, { headers: true }).on('close', function () {
				res.setHeader('Content-Disposition', 'attachment; filename="filename.jpg"');
				res.download(filePath);
			});
		} else {
			const csvString = await writeToString(templateData);
			res.status(200).json({ csvString });
		}
	} catch (err) {
		logger.error(err);
		res.status(500).json({ message: err.message });
	}
});

router.post('/upload', async function (req, res) {
	try {
		const file = req.files.file;
		logger.debug('File upload hander :: upload()');
		logger.debug(`File metadata :: ${JSON.stringify(file)}`);
		if (!file) return res.status(400).send('No files were uploaded.');
		const fileId = `tmp-${Date.now()}`;
		const fileName = file.name;
		const app = req.params.app;
		file.fileId = fileId;
		logger.debug(`File id of ${file.name} :: ${file.fileId}`);
		const fileExtn = file.name.split('.').pop();
		const chunk = await readChunk(file.tempFilePath, 0, 8);
		const actualExt = await FileType.fromBuffer(chunk);
		// const actualExt = await fileTypeFromBuffer(file.tempFilePath);
		if (!actualExt && fileExtn != 'csv') {
			return res.status(400).json({
				'message': 'Unsupported File Type, Please upload a valid CSV file'
			});
		}
		const worker = new Worker(path.join(__dirname, '../threads/bulk-user-parse-file.js'), {
			workerData: {
				filePath: file.tempFilePath,
				fileId,
				app,
			}
		});
		const payload = {
			_id: fileId,
			app,
			user: req.user._id,
			status: 'Pending',
			fileName: fileName,
			_metadata: {
				version: {
					document: 1
				},
				deleted: false,
				lastUpdated: new Date(),
				createdAt: new Date()
			}
		};
		worker.on('message', async (data) => {
			try {
				if (data.statusCode === 400) {
					payload.status = 'Error';
					payload.message = data.message;
				} else {
					if (!data.data || data.data.length == 0) {
						payload.status = 'Error';
						payload.message = 'Unable to read file, Please upload a valid file.';
					} else {
						payload.status = 'Validating';
						payload.message = 'File was Uploaded to DB, Validation Process has Started';
						data.data.forEach(async (record) => {
							try {
								let bulkUserDoc = new crudder.model(record);
								await bulkUserDoc.save();
							} catch (err) {
								logger.error('Error While Uploading Bulk User Record');
								logger.error(err);
							}
						});
					}
				}
				await fileTransfersCrudder.model.findOneAndUpdate({ _id: payload._id }, { $set: payload });
				fs.unlinkSync(file.tempFilePath);
				await startValidation(req, payload, data.data);

				const finalData = await crudder.model.aggregate([
					{
						$facet: {
							totalCount: [{ $match: { fileId: payload._id } }, { $count: 'count' }],
							successCount: [{ $match: { fileId: payload._id, status: 'Success' } }, { $count: 'count' }],
							errorCount: [{ $match: { fileId: payload._id, status: 'Error' } }, { $count: 'count' }],
							ignoredCount: [{ $match: { fileId: payload._id, status: 'Ignored' } }, { $count: 'count' }]
						}
					}
				]);
				const result = {
					totalCount: (finalData[0].totalCount).length > 0 ? finalData[0].totalCount[0].count : 0,
					successCount: (finalData[0].successCount).length > 0 ? finalData[0].successCount[0].count : 0,
					errorCount: (finalData[0].errorCount).length > 0 ? finalData[0].errorCount[0].count : 0,
					ignoredCount: (finalData[0].ignoredCount).length > 0 ? finalData[0].ignoredCount[0].count : 0,
					'_metadata.lastUpdated': new Date()
				};
				if (result.totalCount > 0) {
					if (result.totalCount == result.errorCount) {
						result.status = 'Error';
						result.message = 'File has errors';
					}
					if (result.totalCount != result.errorCount && result.errorCount > 0) {
						result.status = 'Completed';
						result.message = 'File processed with few errors';
					}
				}
				await fileTransfersCrudder.model.findOneAndUpdate({ _id: payload._id }, { $set: result });
			} catch (err) {
				logger.error('Error from Worker Thread');
				logger.error(err);
			}
		});
		const doc = new fileTransfersCrudder.model(payload);
		await doc.save();
		res.status(200).json(payload);
	} catch (err) {
		logger.error(err);
		res.status(500).json({
			'message': err.message
		});
	}
});


module.exports = router;

function isPasswordInvalid(row) {
	if (row.data.authType == 'local') {
		if (row.data.password.trim().length < config.RBAC_PASSWORD_LENGTH) {
			return true;
		}
		if (config.RBAC_PASSWORD_COMPLEXITY) {
			return !row.data.password.trim().match(passwordPattern);
		}
	}
	return false;
}


async function startValidation(req, fileData, records) {
	try {
		await crudder.model.updateMany({ fileId: fileData._id, status: { $ne: 'Error' }, 'data.authType': { $nin: config.RBAC_USER_AUTH_MODES } }, { $set: { duplicate: false, message: 'Invalid Auth Type', status: 'Error' } });
		await crudder.model.updateMany({ fileId: fileData._id, status: { $ne: 'Error' }, 'data.username': { $in: [null, ''] } }, { $set: { duplicate: false, message: 'Username is a required field', status: 'Error' } });
		await crudder.model.updateMany({ fileId: fileData._id, status: { $ne: 'Error' }, 'data.authType': 'local', 'data.password': { $in: [null, ''] } }, { $set: { duplicate: false, message: 'Password is a required field for Local Auth Type', status: 'Error' } });
		await crudder.model.updateMany({ fileId: fileData._id, status: { $ne: 'Error' }, 'data.authType': 'local', 'data.name': { $in: [null, ''] } }, { $set: { duplicate: false, message: 'Name is a required field for Local Auth Type', status: 'Error' } });
		const result = await crudder.model.aggregate([
			{
				$match: {
					fileId: fileData._id,
					status: { $ne: 'Error' }
				}
			},
			{
				$group: {
					_id: '$data.username',
					records: { $push: '$$ROOT' }
				}
			}
		]);
		const duplicates = result.filter(item => item.records.length > 1);
		let validRecords = result.filter(item => item.records.length == 1).map(e => e.records[0]);
		if (duplicates && duplicates.length > 0) {
			logger.debug('Duplicate Records found in the sheet, Skipping those records');
			duplicates.map(async (item) => {
				await crudder.model.updateMany({ fileId: fileData._id, 'data.username': item._id }, { $set: { duplicate: true, message: 'Duplicate Record Present in the Sheet', status: 'Error' } });
			});
		}
		// const invalidAuthModes = validRecords.filter(e => config.RBAC_USER_AUTH_MODES.indexOf(e.data.authType) == -1);
		// validRecords = validRecords.filter(e => config.RBAC_USER_AUTH_MODES.indexOf(e.data.authType) > -1);
		// if (invalidAuthModes && invalidAuthModes.length > 0) {
		// 	logger.debug('Invalid Auth Modes found in the sheet, Skipping those records');
		// 	invalidAuthModes.map(async (item) => {
		// 		await crudder.model.findOneAndUpdate({ fileId: fileData._id, 'data.username': item.data.username }, { $set: { duplicate: false, message: `${item.data.authType} Auth Mode Not Configured`, status: 'Error' } });
		// 	});
		// }
		// const nameNotSet = validRecords.filter(e => e.data.authType == 'local' && (!e.data.name || !e.data.name.trim()));
		// validRecords = validRecords.filter(e => e.data.authType == 'local' && (!e.data.name || !e.data.name.trim()));
		// if (nameNotSet && nameNotSet.length > 0) {
		// 	logger.debug('Name not set for few records, Skipping those records');
		// 	nameNotSet.map(async (item) => {
		// 		await crudder.model.findOneAndUpdate({ fileId: fileData._id, 'data.username': item.data.username }, { $set: { duplicate: false, message: 'Name not set for Local Auth Mode', status: 'Error' } });
		// 	});
		// }
		// const passwordNotSet = validRecords.filter(e => e.data.authType == 'local' && (!e.data.password || !e.data.password.trim()));
		// validRecords = validRecords.filter(e => e.data.authType == 'local' && (!e.data.password || !e.data.password.trim()));
		// if (passwordNotSet && passwordNotSet.length > 0) {
		// 	logger.debug('Password not set for few records, Skipping those records');
		// 	passwordNotSet.map(async (item) => {
		// 		await crudder.model.findOneAndUpdate({ fileId: fileData._id, 'data.username': item.data.username }, { $set: { duplicate: false, message: 'Password not set for Local Auth Mode', status: 'Error' } });
		// 	});
		// }
		const passwordInvalid = validRecords.filter(e => isPasswordInvalid(e));
		validRecords = validRecords.filter(e => !isPasswordInvalid(e));
		if (passwordInvalid && passwordInvalid.length > 0) {
			logger.debug('Password Invalid, Skipping those records');
			passwordInvalid.map(async (item) => {
				await crudder.model.findOneAndUpdate({ fileId: fileData._id, 'data.username': item.data.username }, { $set: { duplicate: false, message: 'Incorrect Password Format', status: 'Error' } });
			});
		}
		if (validRecords.length == 0) {
			return await fileTransfersCrudder.model.findOneAndUpdate({ _id: fileData._id }, { $set: { message: 'No Valid Record Available in File', status: 'Error' } });
		}
		const userModel = mongoose.model('user');
		const groupModel = mongoose.model('group');
		await validRecords.reduce(async (prev, item) => {
			try {
				await prev;
				const userExistsInPlatform = await userModel.findOne({ _id: item.data.username }, { _id: 1, 'basicDetails.name': 1 }).lean();
				const userExistsInApp = await groupModel.findOne({ name: '#', users: item.data.username, app: fileData.app }, { _id: 1, name: 1 }).lean();
				if (userExistsInApp) {
					await crudder.model.findOneAndUpdate({ fileId: fileData._id, 'data.username': item.data.username }, { $set: { duplicate: false, existsInApp: true, existsInPlatform: true, message: 'User Exists in App', status: 'Ignored' } });
				} else if (userExistsInPlatform) {
					await crudder.model.findOneAndUpdate({ fileId: fileData._id, 'data.username': item.data.username }, { $set: { duplicate: false, existsInApp: false, existsInPlatform: true, message: 'User Exists in Platform, Importing User to App' } });
					await importUserToApp(req, item, fileData);
					await crudder.model.findOneAndUpdate({ fileId: fileData._id, 'data.username': item.data.username }, { $set: { message: 'User Imported to App', status: 'Success' } });
				} else {
					if (item.data.type == 'local') {
						await crudder.model.findOneAndUpdate({ fileId: fileData._id, 'data.username': item.data.username }, { $set: { duplicate: false, existsInApp: false, existsInPlatform: false, message: 'User doesn\'t Exists in Platform, Creating New User' } });
					} else {
						await crudder.model.findOneAndUpdate({ fileId: fileData._id, 'data.username': item.data.username }, { $set: { duplicate: false, existsInApp: false, existsInPlatform: false, message: 'User doesn\'t Exists in Platform, Importing User from Azure' } });
					}
					await createNewUser(req, item, fileData);
					await crudder.model.findOneAndUpdate({ fileId: fileData._id, 'data.username': item.data.username }, { $set: { message: 'User Created and Imported to App', status: 'Success' } });
				}
			} catch (err) {
				logger.error('Error While Trying to Validating Bulk User Records for:', fileData._id);
				logger.error(err);
				await crudder.model.findOneAndUpdate({ fileId: fileData._id, 'data.username': item.data.username }, { $set: { message: err.message, status: 'Error' } });
			}
		}, Promise.resolve());
		return;
		// await Promise.all(promises);
	} catch (err) {
		logger.error('Error While Validating Bulk User Records for:', fileData._id);
		logger.error(err);
		await fileTransfersCrudder.model.findOneAndUpdate({ _id: fileData._id }, { $set: { message: err.message, status: 'Error' } });
	}
}

async function createNewUser(req, record, fileData) {
	if (record.data.authType == 'azure') {
		const data = await cache.getData(req.user._id);
		if (!data) {
			throw new Error('Invalid Azure Token');
		}
		const token = data.azureToken;
		if (!token) {
			throw new Error('Invalid Azure Token');
		}
		const adUser = await adUtils.getUserInfo(record.data.username, token);
		if (adUser && adUser.username == record.data.username) {
			record.data.name = adUser.name;
			record.data.email = adUser.email;
		} else {
			throw new Error(`User ${record.data.username} not found in Azure AD`);
		}
	}
	const userModel = mongoose.model('user');
	const userData = {
		username: record.data.username,
		basicDetails: {
			name: record.data.name,
			alternateEmail: record.data.email
		},
		accessControl: {
			accessLevel: 'Selected',
			apps: []
		},
		auth: {
			authType: record.data.authType
		}
	};
	if (record.data.authType === 'local') {
		userData.password = record.data.password;
	}
	const doc = new userModel(userData);
	doc._req = req;
	await doc.save(req);
	await importUserToApp(req, record, fileData);
}

async function importUserToApp(req, record, fileData) {
	const groupModel = mongoose.model('group');
	const group = await groupModel.findOne({ name: '#', app: fileData.app });
	group.users.push(record.data.username);
	group.users = _.uniq(group.users);
	return await group.save(req);
	// await groupModel.findByIdAndUpdate({ name: '#', app: record.app }, { $push: { users: record.data.username } });
}
const XLSX = require('xlsx');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const logger = global.logger;

function getSheetDataFromGridFS(fileName, db, collection) {
	let dbGFS = mongoose.connection.db;
	let gfsBucket = new mongodb.GridFSBucket(dbGFS, {
		bucketName: `${collection}.fileImport`
	});
	return new Promise((resolve, reject) => {
		gfsBucket.find({
			filename: fileName
		}).toArray(function (err, file) {
			if (err) {
				logger.error(err);
				reject(err);
			}
			if (file[0]) {
				let readstream = gfsBucket.openDownloadStream(file[0]._id);
				readstream.on('error', function (err) {
					logger.error(err);
					reject(err);
				});
				var bufs = [];
				readstream.on('data', function (d) {
					bufs.push(d);
				});
				readstream.on('end', function () {
					var buf = Buffer.concat(bufs);

					resolve(buf);
				});
			} else {
				reject(new Error('Issue in getting data from GridFS '));
			}
		});
	});
}

function objectMapping(sheetJson, mapping) {
	let newDoc = {};
	if (!mapping) return;
	if (mapping && mapping.constructor == {}.constructor) {
		Object.keys(mapping).forEach(_k => {
			if (typeof mapping[_k] == 'string') {
				newDoc[_k] = sheetJson[mapping[_k]];
			} else if (Array.isArray(mapping[_k])) {
				newDoc[_k] = mapping[_k].map(_o => {
					return objectMapping(sheetJson, _o);
				});
				newDoc[_k] = newDoc[_k].filter(_d => _d);
			} else {
				newDoc[_k] = objectMapping(sheetJson, mapping[_k]);
			}
		});
	} else if (typeof mapping == 'string') {
		return sheetJson[mapping];
	}
	if (newDoc && Object.keys(JSON.parse(JSON.stringify(newDoc))).length > 0) {
		return newDoc;
	}
	return;
}

function substituteMappingSheetToSchema(sheetArr, headerMapping) {
	return sheetArr.map(obj => objectMapping(obj, headerMapping));
}

function getSheetData(ws, isHeaderProvided) {
	if (!ws['!ref']) return [];
	let sheetArr = null;
	if (isHeaderProvided) {
		sheetArr = XLSX.utils.sheet_to_json(ws, {
			dateNF: 'YYYY-MM-DD HH:MM:SS'
		});
	} else {
		sheetArr = XLSX.utils.sheet_to_json(ws, {

		});
	}
	return sheetArr;
}

module.exports.getSheetDataFromGridFS = getSheetDataFromGridFS;
module.exports.substituteMappingSheetToSchema = substituteMappingSheetToSchema;
module.exports.getSheetData = getSheetData;
'use strict';

const crypto = require('crypto');
const pem = require('pem');

const config = require('../../../config/config');

const IV_LENGTH = 16;
const logger = global.logger;


function createKeyCert(app) {
	return new Promise((resolve, reject) => {
		const pemOptions = {
			country: process.env.CERTIFICATE_COUNTRY || config.country,
			state: process.env.CERTIFICATE_STATE || config.state,
			locality: process.env.CERTIFICATE_LOCALITY || config.locality,
			organization: app,
			organizationUnit: process.env.CERTIFICATE_ORGANIZATION_UNIT || config.organizationUnit,
			commonName: process.env.CERTIFICATE_COMMON_NAME || config.commonName,
			days: 7300,
			keyBitsize: process.env.KEY_SIZE ? parseInt(process.env.KEY_SIZE, 10) : 4096,
			selfSigned: true,
			emailAddress: process.env.CERTIFICATE_EMAIL || config.emailAddress
		};
		logger.debug(pemOptions);
		return pem.createCertificate(pemOptions, function (err, keys) {
			if (err) {
				logger.error(err);
				reject(err);
			}
			resolve(keys);
		});
	});
}

function encryptUsingPublicKey(text, key) {
	let iv = crypto.randomBytes(IV_LENGTH);
	let cipher = crypto.createCipheriv(config.algorithm, Buffer.from(config.secret), iv);
	let encrypted = cipher.update(text);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	let basepub = Buffer.from(key);
	let initializationVector = crypto.publicEncrypt(basepub, iv);
	return initializationVector.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptUsingPrivateKey(text, key) {
	let textParts = text.split(':');
	let initializationVector = Buffer.from(textParts.shift(), 'hex');
	let iv = crypto.privateDecrypt(key, initializationVector);
	let encryptedText = Buffer.from(textParts.join(':'), 'hex');
	let decipher = crypto.createDecipheriv(config.algorithm, Buffer.from(config.secret), iv);
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);
	return decrypted.toString();
}

function encrypt(plainText, secret) {
	const key = crypto.createHash('sha256').update(String(secret)).digest('base64').substring(0, 32);
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv(config.algorithm, key, iv);
	let cipherText;
	try {
		cipherText = cipher.update(plainText, 'utf8', 'hex');
		cipherText += cipher.final('hex');
		cipherText = iv.toString('hex') + ':' + cipherText;
	} catch (e) {
		cipherText = null;
	}
	return cipherText;
}


function decrypt(cipherText, secret) {
	const key = crypto.createHash('sha256').update(String(secret)).digest('base64').substring(0, 32);
	const iv = Buffer.from(cipherText.split(':')[0], 'hex');
	const textBytes = cipherText.split(':')[1];
	const decipher = crypto.createDecipheriv(config.algorithm, key, iv);
	let decrypted = decipher.update(textBytes, 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	return decrypted;
}


module.exports = {
	createKeyCert,
	encryptUsingPublicKey,
	decryptUsingPrivateKey,
	encrypt,
	decrypt
};
const logger = global.logger;
const definition = require('../helpers/env.variable.definiton').definition;
const { SMCrud, MakeSchema } = require('@appveen/swagger-mongoose-crud');
const schema = MakeSchema(definition);

const options = {
	logger: logger,
	collectionName: 'config.envVariables'
};

const crudder = new SMCrud(schema, 'config.envVariables', options);

// Function to replace values with environment variables if available
function replaceWithEnvVars(data) {
	return data.map(envVar => {
		const envValue = process.env[envVar._id];
		if (envValue !== undefined) {
			envVar.value = envValue;
		}
		return envVar;
	});
}

async function getEnvironmentVariables(req, res) {
	try {
		const minimalInfo = req.query.minimal === 'true';
		if (minimalInfo) {
			let minimalResult = await crudder.model.find({}, { _id: 1, value: 1 });
			minimalResult = replaceWithEnvVars(minimalResult);
			return res.status(200).json(minimalResult);
		}
		const reqParams = {
			filter: req.query.filter || '{}',
			sort: req.query.sort || '_metadata.lastUpdated',
			select: req.query.select || '',
			page: parseInt(req.query.page) || 1,
			count: parseInt(req.query.count) || 10,
			search: req.query.search || null,
			metadata: req.query.metadata ? req.query.metadata.toLowerCase() === 'true' : false,
		};
		try {
			const filter = reqParams.filter ? JSON.parse(reqParams.filter) : {};
			filter['_metadata.deleted'] = false;

			const query = crudder.model.find(filter);

			if (reqParams.select) {
				const selectFields = reqParams.select.split(',');
				query.select(selectFields.join(' '));
			}

			const countPerPage = reqParams.count;
			const startIndex = (reqParams.page - 1) * countPerPage;
			query.skip(startIndex).limit(countPerPage);

			const result = await query.exec();
			const processedResult = replaceWithEnvVars(result);

			res.status(200).json(processedResult);
		} catch (error) {
			logger.error(error);
			res.status(500).json({ error: 'Internal Server Error' });
		}
	} catch (error) {
		logger.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
}

async function environmentVariableCreateOrUpdate(req, res) {
	try {
		const updates = req.body;
		const runTimeUpdates = updates.filter(update => update.classification === 'Runtime');
		const installationUpdates = updates.filter(update => update.classification === 'Installation');

		let environmentVariableUpdated = false;

		for (const update of runTimeUpdates) {
			const { _id, label, category, value, type, description, updatedBy, isActive, isEncrypted, usedIn, classification } = update;

			const result = await crudder.model.updateOne({ _id }, {
				$set: {
					label,
					category,
					value,
					type,
					description,
					updatedBy,
					isActive,
					isEncrypted,
					usedIn,
					classification
				}
			}, { upsert: true });

			if (result.modifiedCount > 0 && !environmentVariableUpdated) {
				environmentVariableUpdated = true;
			}
		}

		const response = {};

		// Set the appropriate message based on whether environment variables were updated
		if (environmentVariableUpdated) {
			response.message = 'Environment variables updated successfully';
		} else {
			response.message = 'Nothing to update';
		}

		// If there are 'Installation' updates, include a message and the list of IDs that were not updated
		if (installationUpdates.length > 0) {
			response.additionalMessage = 'Installation variables cannot be updated via API';
			response.notUpdatedIds = installationUpdates.map(update => update._id);
		}

		res.status(200).json(response);
	} catch (err) {
		logger.error('Error while updating the environment variables');
		logger.error(err);
		res.status(500).json({ error: 'Error while updating the environment variables' });
	}
}

function modifyFilterForApp(req) {
	let filter = req.query.filter;
	let app = req.params.app;
	if (filter && typeof filter === 'string') {
		filter = JSON.parse(filter);
	}
	if (filter && typeof filter === 'object') {
		filter.app = app;
	} else {
		filter = { app };
	}
	filter.classification = 'User';
	req.query.filter = JSON.stringify(filter);
}

function modifyBodyForApp(req) {
	let app = req.params.app;
	req.body.app = app;
	req.body.classification = 'User';
}

function customCreate(req, res) {
	modifyBodyForApp(req);
	crudder.create(req, res);
}
function customIndex(req, res) {
	modifyFilterForApp(req);
	crudder.index(req, res);
}
function customShow(req, res) {
	modifyFilterForApp(req);
	crudder.show(req, res);
}
function customDestroy(req, res) {
	modifyBodyForApp(req);
	crudder.destroy(req, res);
}
function customUpdate(req, res) {
	modifyBodyForApp(req);
	crudder.update(req, res);
}

module.exports = {
	envVariableCrudder: crudder,
	getEnvironmentVariables,
	environmentVariableCreateOrUpdate,
	customIndex,
	customCreate,
	customShow,
	customUpdate,
	customDestroy
};
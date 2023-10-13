const logger = global.logger;
const definition = require('../helpers/env.variable.definiton').definition;
const { SMCrud, MakeSchema } = require("@appveen/swagger-mongoose-crud");
const schema = MakeSchema(definition);

const options = {
    logger: logger,
    collectionName: 'config.envVariables'
}

const crudder = new SMCrud(schema, 'config.envVariables', options);

async function getEnvironmentVariables(req, res) {
    const minimalInfo = req.query.minimal === 'true'; // Check if minimal parameter is set to true

    try {
      if (minimalInfo) {
        // If minimalInfo is true, create an aggregation pipeline to select only _id and value
        const pipeline = [
          {
            $project: {
              _id: 1,
              value: 1,
            },
          },
        ];
  
        const result = await crudder.model.aggregate(pipeline);
        res.json(result);
      } else {
        crudder.index(req, res);
      }
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function environmentVariableCreateOrUpdate(req, res) {
    try {
        const updates = req.body;
        const runTimeUpdates = updates.filter(update => update.classification === 'Runtime' );
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
          response.message = 'Nothing to update'
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

module.exports = {
    envVariableCrudder: crudder,
    getEnvironmentVariables,
    environmentVariableCreateOrUpdate
};
const logger = global.logger;
const definition = require('../helpers/env.variable.definition').definition;
const { SMCrud, MakeSchema } = require("@appveen/swagger-mongoose-crud");
const schema = MakeSchema(definition);

const options = {
    logger: logger,
    collectionName: 'config.envVariables'
}

const crudder = new SMCrud(schema, 'config.envVariables', options);

async function environmentVariableCreateOrUpdate(req, res) {
    try {
        const updates = req.body;

        for (const update of updates) {
            const { _id, label, category, value, type, description, updatedBy, isActive, isEncrypted, usedIn } = update;

            await crudder.model.updateOne({ _id }, {
                $set: {
                    label,
                    category,
                    value,
                    type,
                    description,
                    updatedBy,
                    isActive,
                    isEncrypted,
                    usedIn
                }
            }, { upsert: true });
        }

        res.status(200).json({ message: 'Environment variables updated successfully' });
    } catch (err) {
        logger.error('Error while updating the environment variables');
        logger.error(err);
        res.status(500).json({ error: 'Error while updating the environment variables' });
    }
}

module.exports = {
    envVariableCrudder: crudder,
    index: crudder.index,
    environmentVariableCreateOrUpdate
};

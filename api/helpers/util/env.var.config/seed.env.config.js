const config = require('./env.var.config.json');
const logger = global.logger;
const { envVariableCrudder } = require('../../../controllers/env.variable.controller');

async function seedConfigData() {
  try {
    for (const item of config) {
      try {
        const existingConfig = await envVariableCrudder.model.findOne({ _id: item._id });
        if (!existingConfig) {
          // If it doesn't exist, add it to the collection
          const valueToUse = process.env[item._id] || item.value;
          await envVariableCrudder.model.create({ ...item, value: valueToUse });
        } else if (process.env[item._id]) {
          // If existing config and process.env present, update the value
          existingConfig.value = process.env[item._id];
          await existingConfig.save();
        }
      } catch (error) {
        logger.error(`Error adding/configuring config: ${item._id}`, error);
      }
    }
    logger.info('Successfully seeded/env-configured into db');
  } catch (error) {
    logger.error('Error seeding/configuring config data:', error);
  }
}

module.exports = {
  seedConfigData
};
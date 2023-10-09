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
          await envVariableCrudder.model.create(item);
        }
      } catch (error) {
        logger.error(`Error adding config: ${item.label}`, error);
      }
    }
    logger.info('Successfully seeded env config into db');
  } catch (error) {
    logger.error('Error seeding config data:', error);
  }
}

module.exports = {
  seedConfigData
};
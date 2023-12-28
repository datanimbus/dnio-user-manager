const _ = require('lodash');
const restCrud = require('@appveen/rest-crud');

// Helper function to fetch table schema for MySQL databases
async function fetchTableSchemaFromMySQL(data, tableName) {
	let sql = restCrud[data.type.toLowerCase()];
	const crud = new sql(data.values);
	await crud.connect();
  
	const schemaQuery = `DESCRIBE ${tableName}`;
	const result = await crud.sqlQuery(schemaQuery);
	await crud.disconnect();
  
	return result[0].map(column => ({
	  name: column.Field,
	  type: column.Type,
	  key: column.Key,
	  default: column.Default,
	  extra: column.Extra
	}));
}

function transformSchemaMySQL(schemaFromMySQL, serviceName) {
	return schemaFromMySQL.map(column => {
	  const transformedColumn = {
		key:  _.camelCase(column.name),
		type: transformType(column.type),
		properties: {
		  name: column.name,
		  dataPath:  _.camelCase(column.name)
		}
	  };
  
	  if (column.key) {
		if(column.key === 'PRI'){
			transformedColumn.key = "_id";
			transformedColumn.prefix = _.toUpper(_.camelCase(serviceName.substring(0,3)));
			transformedColumn.suffix = null;
			transformedColumn.padding = null;
			transformedColumn.counter = 1001;
			transformedColumn.properties.dataPath = '_id';
			transformedColumn.properties.dataKey = '_id';
		}
	  }
      // TODO: Add default, nullable and extra
	  return transformedColumn;
	});
}

function transformType(mysqlType) {
    if (mysqlType === 'tinyint(1)') {
        return 'Boolean';
    } else if (mysqlType.includes('int')) {
        return 'Number';
    } else if (mysqlType.includes('char') || mysqlType.includes('text')) {
        return 'String';
    } else if (mysqlType.includes('date') || mysqlType.includes('datetime')) {
        return 'Date';
    } else if (mysqlType.includes('json')) {
        return 'Object';
    }

    return mysqlType;
}




module.exports = {
    fetchTableSchemaFromMySQL,
    transformSchemaMySQL
}
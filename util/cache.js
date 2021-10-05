const bluebird = require('bluebird');
const redis = require('ioredis');

let host = process.env.CACHE_HOST;
let port = process.env.CACHE_PORT;

let client = null;

let logger = global.logger;

let e = {};

function getClusterNodes() {
	let nodes = [];
	//format: 127.0.0.1,127.0.0.2:8990 results in 127.0.0.1:6379 and 127.0.0.2:8990 respectively
	let clusterNodes = process.env.CACHE_CLUSTER.split(',');
	clusterNodes.map(node => {
		nodes.push({
			host: node.split(':')[0],
			port: node.split(':')[1] || '6379',
		});
	});
	return nodes;
}

e.init = () => {
	if (process.env.CACHE_CLUSTER) {
		logger.info('Connecting to cache cluster');
		logger.info('Cache cluster nodes :: ', JSON.stringify(getClusterNodes()));
		client = new redis.Cluster(getClusterNodes());
	} else {
		logger.info('Connecting to standalone cache');
		client = redis.createClient(port, host);
	}
	client = bluebird.promisifyAll(client);
	client.on('error', function (err) {
		logger.error(err.message);
	});

	client.on('connect', function () {
		logger.info('Cache client connected');
	});
};

e.setApp = async (_key, _apps) => {
	await client.del(`app:${_key}`);
	await client.setAsync(`app:${_key}`, JSON.stringify(_apps));
};

e.unsetApp = async (_key) => {
	await client.del(`app:${_key}`);
};


module.exports = e;
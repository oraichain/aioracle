const { MongoClient } = require('mongodb');
const { env } = require('./config');

const client = new MongoClient(env.MONGO_URL);

module.exports = client;
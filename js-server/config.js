const config = {};
if (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') {
    config.path = `.env.${process.env.NODE_ENV}`;
}
require('dotenv').config(config)

const env = {
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    MNEMONIC: process.env.MNEMONIC,
    RPC_URL: process.env.NETWORK_RPC,
    MONGO_URL: process.env.MONGO_URL || "mongodb://foo:bar@localhost:27017/",
}

const constants = {
    REQUESTS_COLLECTION: "requests",
    MERKLE_ROOTS_COLLECTION: "merkle_roots",
    TIMEOUT_HEIGHT: 30,
    TIMEOUT_INTERVAL_CHECK: 3000,
    BASE_GAS_PRICES: 0,
    GAS_LIMITS: 20000000
}

module.exports = { config, env, constants };
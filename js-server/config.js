const config = {};
if (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') {
    config.path = `.env.${process.env.NODE_ENV}`;
}
require('dotenv').config(config)

const env = {
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    MNEMONIC: process.env.MNEMONIC,
    RPC_URL: process.env.NETWORK_RPC,
    LCD_URL: process.env.NETWORK_LCD || "https://testnet-lcd.orai.io",
    MONGO_URL: process.env.MONGO_URL || "mongodb://foo:bar@localhost:27017/",
    ELASTICSEARCH_NODE: process.env.ELASTICSEARCH_NODE || "http://localhost:9200",
    ELASTIC_USERNAME: process.env.ELASTIC_USERNAME || "elastic",
    ELASTIC_PASSWORD: process.env.ELASTIC_PASSWORD || "changeme",
    PROCESS_INTERVAL: parseInt(process.env.PROCESS_INTERVAL) || 10000,
    PORT: parseInt(process.env.PORT) || 8080,
    HOST: process.env.HOST || '0.0.0.0'
}

const constants = {
    mongo: {
        REQUESTS_COLLECTION: "requests",
        MERKLE_ROOTS_COLLECTION: "merkle_roots",
        EXECUTORS_COLLECTION: "executors",
    },
    TIMEOUT_HEIGHT: 30,
    TIMEOUT_INTERVAL_CHECK: 3000,
    BASE_GAS_PRICES: 0,
    GAS_LIMITS: 20000000
}

module.exports = { config, env, constants };
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
    CHAIN_ID: process.env.CHAIN_ID || "Oraichain-testnet",
    MONGO_URL: process.env.MONGO_URL || "mongodb://foo:bar@localhost:27017/",
    ELASTICSEARCH_NODE: process.env.ELASTICSEARCH_NODE || "http://localhost:9200",
    ELASTIC_USERNAME: process.env.ELASTIC_USERNAME || "elastic",
    ELASTIC_PASSWORD: process.env.ELASTIC_PASSWORD || "changeme",
    PROCESS_INTERVAL: parseInt(process.env.PROCESS_INTERVAL) || 10000,
    PORT: parseInt(process.env.PORT) || 8080,
    HOST: process.env.HOST || '0.0.0.0',
    NETWORK_TYPE: process.env.NETWORK_TYPE,
    CONTRACT_ADDR_BENCHMARKING: process.env.CONTRACT_ADDR_BENCHMARKING,
    WS_PORT: process.env.WS_PORT || 7071,
    WS_HOST: process.env.WS_HOST || 'localhost'
}

const constants = {
    mongo: {
        REQUESTS_COLLECTION: "requests",
        MERKLE_ROOTS_COLLECTION: "merkle_roots",
        EXECUTORS_COLLECTION: "executors",
    },
    TIMEOUT_HEIGHT: 100,
    TIMEOUT_INTERVAL_CHECK: 5000,
    BASE_GAS_PRICES: 0,
    GAS_LIMITS: 20000000
}

const getCors = () => {

    let cors = {
        "origin": "*",
        "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        "preflightContinue": true,
        "optionsSuccessStatus": 204
    };

    switch (env.NETWORK_TYPE) {
        case 'testnet':
        case 'local':
            break;
        default:
            cors.origin = ["https://scan.orai.io", "https://api.wallet.orai.io", /\.localhost$/];
            cors.preflightContinue = false;
            cors.methods = "GET,POST";
            break;
    }
    return cors;
}

module.exports = { config, env, constants, getCors };
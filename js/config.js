const config = {};
if (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') {
    config.path = `.env.${process.env.NODE_ENV}`;
}

require('dotenv').config(config)

const env = {
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    MNEMONIC: process.env.MNEMONIC,
    RPC_URL: process.env.NETWORK_RPC,
    GAS_PRICE: process.env.GAS_PRICE || 0,
    GAS_LIMITS: process.env.GAS_LIMITS ? process.env.GAS_LIMITS : 2000000,
    WEBSOCKET_URL: process.env.WEBSOCKET_URL || "ws://testnet-rpc.orai.io",
    REPLAY: process.env.REPLAY || false,
    START_STAGE: process.env.START_STAGE,
}

module.exports = { config, env };
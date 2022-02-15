const config = {};
if (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') {
    config.path = `.env.${process.env.NODE_ENV}`;
}

require('dotenv').config(config)

const env = {
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    MNEMONIC: process.env.MNEMONIC,
    RPC_URL: process.env.NETWORK_RPC,
    WEBSOCKET_URL: process.env.WEBSOCKET_URL || "ws://testnet-rpc.orai.io",
    REPLAY: process.env.REPLAY || "false",
    START_STAGE: process.env.START_STAGE,
    LCD_URL: process.env.LCD_URL || "https://testnet-lcd.orai.io",
    BACKEND_URL: process.env.BACKEND_URL,
    ENCRYPTED_MNEMONIC: process.env.ENCRYPTED_MNEMONIC,
}

const network = {
    prefix: "orai",
    path: "m/44'/118'/0'/0/0",
}

module.exports = { config, env, network };
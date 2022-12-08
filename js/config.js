const config = {};
if (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') {
    config.path = `.env.${process.env.NODE_ENV}`;
}

require('dotenv').config(config)

const env = {
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    MNEMONIC: process.env.MNEMONIC,
    RPC_URL: process.env.NETWORK_RPC,
    WEBSOCKET_URL: process.env.WEBSOCKET_URL || "ws://rpc.orai.io",
    REPLAY: process.env.REPLAY || "false",
    DOCKER: process.env.DOCKER || "false",
    START_STAGE: process.env.START_STAGE,
    LCD_URL: process.env.LCD_URL || "https://lcd.orai.io",
    BACKEND_URL: process.env.BACKEND_URL,
    ENCRYPTED_MNEMONIC: process.env.ENCRYPTED_MNEMONIC,
    PIN: process.env.PIN,
    PING_INTERVAL: parseInt(process.env.PING_INTERVAL) || 5000,
    PING_CONTRACT: process.env.PING_CONTRACT,
    CHAIN_ID: process.env.CHAIN_ID,
    WS_PORT: process.env.WS_PORT || 4999,
    WS_HOST: process.env.WS_HOST
}

const network = {
    rpc: env.RPC_URL || "https://rpc.orai.io",
    lcd: env.LCD_URL || "https://lcd.orai.io",
    chainId: env.CHAIN_ID || "Oraichain",
    prefix: "orai",
    path: "m/44'/118'/0'/0/0",
}

module.exports = { config, env, network };
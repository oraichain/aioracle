const OraiwasmJs = require('@oraichain/oraiwasm-js').default;

const oraiwasmJs = new OraiwasmJs(process.env.LCD_URL || 'https://testnet-lcd.orai.io', process.env.CHAIN_ID || 'Oraichain-testnet');
oraiwasmJs.setBech32MainPrefix('orai');

module.exports = oraiwasmJs;
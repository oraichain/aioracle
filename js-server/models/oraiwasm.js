const OraiwasmJs = require('@oraichain2/oraiwasm-js').default;

const oraiwasmJs = new OraiwasmJs(process.env.URL || 'https://testnet-lcd.orai.io', process.env.CHAIN_ID || 'Oraichain-testnet');
oraiwasmJs.setBech32MainPrefix('orai');

module.exports = oraiwasmJs;
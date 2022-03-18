const { env } = require('../config');

const OraiwasmJs = require('@oraichain/oraiwasm-js').default;

const oraiwasmJs = new OraiwasmJs(env.LCD_URL, env.CHAIN_ID);
oraiwasmJs.setBech32MainPrefix('orai');

module.exports = oraiwasmJs;
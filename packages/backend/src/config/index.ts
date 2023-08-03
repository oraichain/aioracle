const configDotEnv = {};
const baseDir = __dirname + '/../../';

if (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') {
  configDotEnv['path'] = `${baseDir}.env.${process.env.NODE_ENV}`;
}
require('dotenv').config(configDotEnv);

const configDefault = {
  basedir: baseDir,
  appdir: baseDir + 'src/',
  storagedir: baseDir + 'storage/',

  PORT: parseInt(process.env.PORT) || 7000,
  HOST: process.env.HOST || 'localhost',
  WS_PORT: parseInt(process.env.WS_PORT) || 7071,
  PROCESS_INTERVAL: parseInt(process.env.PROCESS_INTERVAL) || 10000,
  RPC_URL: process.env.NETWORK_RPC,
  RUN_INTERVAL: '1',
  BASE_GAS_PRICES: '0.001',
};

const config = Object.assign(configDefault, process.env);
export default config;

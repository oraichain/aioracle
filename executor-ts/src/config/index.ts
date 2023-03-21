import { config as dotenvLib } from 'dotenv';
import * as fs from 'fs';

const pathEnv = [
  `.env.${process.env.NODE_ENV}`,
  '.env',
];
const baseDir = __dirname + '/../../';
const getPathEnv = () => {
  for (const path of pathEnv) {
    if (fs.existsSync(path)) {
      return path;
    }
    if (fs.existsSync(baseDir + path)) {
      return baseDir + path;
    }
  }
  return null;
}
const configDotenv: any = {
  path: getPathEnv(),
};
dotenvLib(configDotenv);
if (configDotenv.path) {
  console.log('++++ Load file env', configDotenv.path);
}

const configDefault = {
  basedir: baseDir,
  appdir: baseDir + 'src/',
  storagedir: baseDir + 'storage/',
  isProd: process.env.APP_ENV &&
    (process.env.APP_ENV.toLowerCase() === 'prod' ||
      process.env.APP_ENV.toLowerCase() === 'production')
    ? true : false,
  RPC_URL: process.env.NETWORK_RPC || 'https://rpc.orai.io',
  CHAIN_ID: 'Oraichain',
  WEBSOCKET_URL: 'ws://rpc.orai.io',
  REPLAY: 'false',
  DOCKER: 'false',
  PING_INTERVAL: '1209600000', // mssecond = 14 day //
  WS_HOST: 'localhost',
  WS_PORT: '4999',
  SENTRY_DNS: 'https://cc0864c4cee645a687ce9696dc3da77b@o1323226.ingest.sentry.io/4504630945185792',
  GAS_AMOUNT: '0',
  LOG_FILE: '0',

  prefix: "orai",
  path: "m/44'/118'/0'/0/0",
};

const config: any = Object.assign(configDefault, process.env);

config.PING_INTERVAL = parseInt(config.PING_INTERVAL);
config.WS_PORT = parseInt(config.WS_PORT);
if (!config.NETWORK_TYPE) {
  if (config.RPC_URL && config.RPC_URL.includes('testnet')) {
    config.NETWORK_TYPE = 'testnet';
  } else {
    config.NETWORK_TYPE = 'mainnet';
  }
}

export default config;

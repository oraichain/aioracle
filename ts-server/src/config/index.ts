const configDotEnv = {};
const baseDir = __dirname + '/../../';

if (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') {
  configDotEnv['path'] = `${baseDir}.env.${process.env.NODE_ENV}`;
}
require('dotenv').config(configDotEnv);

const configDefault = {
  appdir: __dirname + '/../',
  basedir: baseDir,
  isProd: process.env.APP_ENV === 'PROD' ? true : false,

  PORT: parseInt(process.env.PORT) || 7000,
  WS_PORT: parseInt(process.env.WS_PORT) || 7071,
  PROCESS_INTERVAL: parseInt(process.env.PROCESS_INTERVAL) || 10000,
};

const config = Object.assign(configDefault, process.env);
export default config;

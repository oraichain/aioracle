require('dotenv').config();

const configDefault = {
  APP_ENV: 'DEV',
  APP_URL: 'http://localhost:3000',
  PORT: 3000,

  DATABASE_HOST: 'localhost',
  DATABASE_PORT: 3306,
  DATABASE_USERNAME: '',
  DATABASE_PASSWORD: '',
  DATABASE_NAME: 'ai_oracle',

  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379,
  REDIS_PASSWORD: '',

  QUEUE_REDIS_DB: 1,
  QUEUE_REDIS_PREFIX: 'oracle_q_',

  AI_URL: 'https://ai.io',
  INTERNAL_KEY: '',

  CRAW_URL: 'https://deep-index.moralis.io',
  CRAW_APIKEY: '',

  SENDGRID_API_KEY: '',
  SENDGRID_SENDER: "no-reply@airight.io",

  appdir: __dirname + '/../',
  basedir: __dirname + '/../../',
  isProd: process.env.APP_ENV === 'PROD' ? true : false
};

const config = Object.assign(configDefault, process.env);
export default config;

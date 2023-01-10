import config from '../config';

const siteWhiteList = [
  'https://scan.orai.io',
  'https://api.wallet.orai.io',
];

const getCors = () => {
  let cors = {
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": true,
    "optionsSuccessStatus": 204,
    credentials: true
  };

  switch (config.NETWORK_TYPE) {
    case 'testnet':
    case 'local':
      cors['origin'] = '*';
      cors['origin'] = function (origin, callback) {
        if (!origin || siteWhiteList.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      };
      break;
    default: // mainnet
      cors['origin'] = function (origin, callback) {
        if (!origin || siteWhiteList.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      };
      cors.preflightContinue = false;
      cors.methods = "GET,POST";
      break;
  }
  return cors;
}

export const CORS_SITE = getCors();

export const MONGO = {
  REQUESTS_COLLECTION: "requests",
  MERKLE_ROOTS_COLLECTION: "merkle_roots",
  EXECUTORS_COLLECTION: "executors",
};

export const COMMON = {
  TIMEOUT_HEIGHT: 100,
  TIMEOUT_INTERVAL_CHECK: 5000,
  BASE_GAS_PRICES: 0,
  GAS_LIMITS: 20000000
};

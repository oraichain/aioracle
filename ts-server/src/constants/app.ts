import config from '../config';

export const getCors = () => {
  let cors = {
    "origin": ["*"],
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": true,
    "optionsSuccessStatus": 204
  };

  switch (config.NETWORK_TYPE) {
    case 'testnet':
    case 'local':
      break;
    default:
      cors.origin = ["https://scan.orai.io", "https://api.wallet.orai.io"];
      cors.preflightContinue = false;
      cors.methods = "GET,POST";
      break;
  }
  return cors;
}

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

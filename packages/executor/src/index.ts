import { wsClientConnect } from './utils/ws';
import { collectPin } from './utils/prompt';
import { evaluatePin } from './utils/crypto';
import config from './config';
import { logError } from './utils/logs';
import { SentryTrace } from './helpers/sentry';
import { sleep } from './utils';

SentryTrace.init();
SentryTrace.transaction({
  op: 'op_executor_js_start',
  name: 'Executor transaction js start'
});

const start = async () => {
  try {
    let mnemonic = config.MNEMONIC;
    // prompt password if users use encrypted mnemonic
    if (config.ENCRYPTED_MNEMONIC) {
      let pin = config.PIN;
      // env for non-docker program
      if (config.DOCKER === 'false') {
        pin = await collectPin();
      }
      mnemonic = evaluatePin(pin, config.ENCRYPTED_MNEMONIC);
    } else {
      if (!mnemonic) {
        throw 'You need to have either mnemonic or encrypted mnemonic ' + 'in your .env file to start the application!';
      }
    }
    await processRequestWrapper(mnemonic);
    // if (config.NETWORK_TYPE !== 'testnet') {
    //   ping(mnemonic);
    // }
  } catch (error) {
    logError(error, 'error when starting the program: ');
    console.log('the program will exit after 10 seconds...');
    await sleep(10000);
    process.exit(0);
  }
};

const processRequestWrapper = async (mnemonic: string) => {
  try {
    console.log('\x1b[36m%s\x1b[0m', '\nOraichain AI Executor program, v1.0.0\n');
    wsClientConnect(mnemonic);
  } catch (error) {
    logError(error, 'error rocess request program');
    // sleep 5s then start again
    await sleep(5000);
    await processRequestWrapper(mnemonic);
  }
};

start();

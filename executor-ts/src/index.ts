import { processRequest } from './utils/process-request';
import { getStageInfo } from './utils/common';
import { wsClientConnect } from './utils/ws';
import { collectPin } from './utils/prompt';
import { evaluatePin } from './utils/crypto';
import { execute, queryWasm, getFirstWalletPubkey } from './utils/cosmjs';
import config from "./config";
import { logError } from "./utils/logs";
import { SentryTrace } from './helpers/sentry';
import { sleep } from './utils';
import { QueryPingInfoResponse } from './dtos';

SentryTrace.init();
SentryTrace.transaction({
  op: "op_executor_js_start",
  name: "Executor transaction js start",
});

const start = async () => {
  try {
    let mnemonic = config.MNEMONIC;
    // prompt password if users use encrypted mnemonic
    if (config.ENCRYPTED_MNEMONIC) {
      let pin = config.PIN;
      // env for non-docker program
      if (config.DOCKER === "false") {
        pin = await collectPin();
      }
      mnemonic = evaluatePin(pin, config.ENCRYPTED_MNEMONIC);
    } else {
      if (!mnemonic) {
        throw 'You need to have either mnemonic or encrypted mnemonic ' +
        'in your .env file to start the application!';
      }
    }
    await processRequestWrapper(mnemonic);
    if (config.NETWORK_TYPE !== 'testnet') {
      ping(mnemonic);
    }
  } catch (error) {
    logError(error, 'error when starting the program: ');
    console.log("the program will exit after 10 seconds...");
    await sleep(10000);
    process.exit(0);
  }
}

const processRequestWrapper = async (mnemonic: string) => {
  try {
    // query lalest stage
    let { checkpoint, latest_stage } =
      await getStageInfo(config.CONTRACT_ADDRESS);
    if (config.REPLAY === 'true') {
      for (
        let i = parseInt(config.START_STAGE) || checkpoint;
        i <= latest_stage;
        i++
      ) {
        await processRequest(i, mnemonic, true);
      }
    }
    console.log('\x1b[36m%s\x1b[0m', "\nOraichain AI Executor program, v0.5.0\n")
    wsClientConnect(mnemonic);
  } catch (error) {
    logError(error, 'error rocess request program');
    // sleep 5s then start again
    await sleep(5000);
    await processRequestWrapper(mnemonic);
  }
}

const ping = async (mnemonic: string) => {
  const contract = config.PING_CONTRACT;
  while (true) {
    try {
      const walletPubkey = await getFirstWalletPubkey(mnemonic);
      // collect info about ping and ping jump, ok to ping => ping
      const ping = await queryWasm(contract, JSON.stringify({
        get_ping_info: walletPubkey
      })) as QueryPingInfoResponse;
      // valid case
      if (
        ping.current_height - ping.ping_info.latest_ping_height >= ping.ping_jump ||
        ping.ping_info.latest_ping_height === 0
      ) {
        console.log('ready to ping');
        const pingMsg = {
          ping: { pubkey: walletPubkey }
        }
        const result = await execute({
          mnemonic,
          address: contract,
          handleMsg: pingMsg,
          gasData: { gasAmount: config.GAS_AMOUNT, denom: 'orai' },
        });
        console.log("ping result: ", result);
      }
    } catch (error) {
      logError(error, 'error ping');
    } finally {
      await sleep(config.PING_INTERVAL);
    }
  }
}

start();

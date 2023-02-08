// set node env config
const { env } = require('./config');
const { processRequestAwait } = require('./process-request');
const { getStageInfo, writeErrorMessage } = require('./utils');
const connect = require('./ws');
const { collectPin } = require('./prompt');
const { evaluatePin } = require('./crypto');
const fs = require('fs');
const { execute, queryWasm, getFirstWalletPubkey } = require('./cosmjs');
const writeStream = fs.createWriteStream(process.cwd() + '/debug.log', {
    flags: 'a+'
});
const { SentryTrace } = require('./sentry');

SentryTrace.init();
SentryTrace.transaction({
    op: "op_executor_js_start",
    name: "Executor transaction js start",
});

const start = async () => {
    try {
        let mnemonic = env.MNEMONIC;
        // prompt password if users use encrypted mnemonic
        if (env.ENCRYPTED_MNEMONIC) {
            let pin = env.PIN;
            // env for non-docker program
            if (env.DOCKER === "false") pin = await collectPin();
            mnemonic = evaluatePin(pin, env.ENCRYPTED_MNEMONIC);
        } else {
            if (!mnemonic) {
                throw "You need to have either mnemonic or encrypted mnemonic in your .env file to start the application!";
            }
        }
        await processRequestWrapper(mnemonic);
        if (env.NETWORK_TYPE !== 'testnet') {
            ping(mnemonic);
        }
    } catch (error) {
        SentryTrace.capture(error, 'error when starting the program: ');
        writeStream.write(writeErrorMessage(error), (err) => {
            if (err) console.log("error when appending error to log file: ", err);
        })
        SentryTrace.finish();
        console.log("the program will exit after 10 seconds...");
        await new Promise(resolve => setTimeout(resolve, 10000));
        process.exit(0);
    }
}

const processRequestWrapper = async (mnemonic) => {
    try {
        // query lalest stage
        let { checkpoint, latest_stage, checkpoint_threshold } = await getStageInfo(env.CONTRACT_ADDRESS);
        if (env.REPLAY === 'true') {
            for (let i = env.START_STAGE || parseInt(checkpoint); i <= latest_stage; i++) {
                await processRequestAwait(parseInt(i), mnemonic);
            }
        }
        console.log('\x1b[36m%s\x1b[0m', "\nOraichain AI Executor program, v0.4.1\n")
        connect(mnemonic);
    } catch (error) {
        SentryTrace.capture(error, 'Error while trying to run the program: ');
        SentryTrace.finish();
        writeStream.write(writeErrorMessage(error), (err) => {
            if (err) console.log("error when appending error to log file: ", err);
        })
        // sleep 5s then start again
        await new Promise(resolve => setTimeout(resolve, 5000));
        await processRequestWrapper(mnemonic);
    }
}

const ping = async (mnemonic) => {
    const contract = env.PING_CONTRACT;
    while (true) {
        try {
            const walletPubkey = await getFirstWalletPubkey(mnemonic);
            // collect info about ping and ping jump, ok to ping => ping
            const ping = await queryWasm(contract, JSON.stringify({
                get_ping_info: walletPubkey
            }));
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
                    gasData: { gasAmount: env.GAS_AMOUNT, denom: "orai" },
                });
                console.log("ping result: ", result);
            }
        } catch (error) {
            SentryTrace.capture(error, 'Error ping');
            SentryTrace.finish();
            writeStream.write(writeErrorMessage(error), (err) => {
                if (err) console.log("error when appending error to log file: ", err);
            })
        } finally {
            await new Promise(resolve => setTimeout(resolve, env.PING_INTERVAL));
        }
    }
}

start();

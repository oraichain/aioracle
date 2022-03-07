// set node env config
const { env } = require('./config');
const { processRequestAwait } = require('./process-request');
const { getStageInfo } = require('./utils');
const connect = require('./ws');
const { collectPin } = require('./prompt');
const { evaluatePin } = require('./crypto');
const fs = require('fs');
const { execute, getFirstWalletAddr, queryWasm } = require('./cosmjs');
const writeStream = fs.createWriteStream(process.cwd() + '/debug.log', {
    flags: 'a+'
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
        ping(mnemonic);
    } catch (error) {
        console.log("error when starting the program: ", error);
        writeStream.write(`Date: ${new Date().toUTCString()}\nError: ${String(error)}\n\n`, (err) => {
            if (err) console.log("error when appending error to log file: ", err);
        })
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
        console.log('\x1b[36m%s\x1b[0m', "\nOraichain AI Executor program, v0.3.1\n")
        connect(mnemonic);
    } catch (error) {
        console.log("Error while trying to run the program: ", error);
        writeStream.write(`Date: ${new Date().toUTCString()}\nError: ${String(error)}\n\n`, (err) => {
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
            const walletAddr = await getFirstWalletAddr(mnemonic);
            // collect info about round and round jump, ok to ping => ping
            const round = await queryWasm(contract, JSON.stringify({
                get_round: walletAddr
            }));
            // valid case
            if (
                round.current_height - round.round_info.height >= round.round_jump ||
                round.round_info.height === 0
            ) {
                console.log('ready to ping');
                const pingMsg = {
                    ping: {}
                }
                const result = await execute({ mnemonic, address: contract, handleMsg: pingMsg, gasData: { gasAmount: '0', denom: 'orai' } });
                console.log("ping result: ", result);
            }
        } catch (error) {
            writeStream.write(`Date: ${new Date().toUTCString()}\nError: ${String(error)}\n\n`, (err) => {
                if (err) console.log("error when appending error to log file: ", err);
            })
        } finally {
            await new Promise(resolve => setTimeout(resolve, env.PING_INTERVAL));
        }
    }
}

start();
// set node env config
const { env } = require('./config');
const processRequest = require('./process-request');
const { getStageInfo } = require('./utils');
const connect = require('./ws');
const { collectPin } = require('./prompt');
const { evaluatePin } = require('./crypto');
const fs = require('fs');
const writeStream = fs.createWriteStream(__dirname + '/debug.log', {
    flags: 'a+'
});

const start = async () => {

    let mnemonic = env.MNEMONIC;
    // prompt password if users use encrypted mnemonic
    if (env.ENCRYPTED_MNEMONIC) {
        const pin = await collectPin();
        mnemonic = evaluatePin(pin, env.ENCRYPTED_MNEMONIC);
    } else {
        if (!mnemonic) {
            console.log("You need to have either mnemonic or encrypted mnemonic in your .env file to start the application!");
            process.exit(0);
        }
    }
    await process(mnemonic);
}

const process = async (mnemonic) => {
    try {
        // query lalest stage
        let { checkpoint, latest_stage, checkpoint_threshold } = await getStageInfo(env.CONTRACT_ADDRESS);
        if (env.REPLAY) {
            for (let i = env.START_STAGE || parseInt(checkpoint); i <= latest_stage; i++) {
                await processRequest(parseInt(i), mnemonic);
            }
        }
        console.log('\x1b[36m%s\x1b[0m', "\nOraichain Oracle Runner, v1.0.0\n")
        connect(mnemonic);
    } catch (error) {
        console.log("Error while trying to run the program: ", error);
        writeStream.write(`Date: ${new Date().toUTCString()}\nError: ${String(error)}\n\n`, (err) => {
            if (err) console.log("error when appending error to log file: ", err);
        })
        // sleep 5s then start again
        await new Promise(resolve => setTimeout(resolve, 5000));
        await process(mnemonic);
    }
}

start();
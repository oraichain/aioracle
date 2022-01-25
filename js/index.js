// set node env config
const { env } = require('./config');
const processRequest = require('./process-request');
const { getStageInfo } = require('./utils');
const connect = require('./ws');

const start = async () => {

    // query lalest stage
    let { checkpoint, latest_stage, checkpoint_threshold } = await getStageInfo(env.CONTRACT_ADDRESS);
    if (env.REPLAY) {
        for (let i = env.START_STAGE || parseInt(checkpoint); i <= latest_stage; i++) {
            await processRequest(parseInt(i));
        }
    }

    console.log('\x1b[36m%s\x1b[0m', "\nOraichain Oracle Runner, v1.0.0\n")
    connect();
}

start();
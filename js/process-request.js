const { submitReport, checkSubmit, getRequest, writeErrorMessage } = require('./utils');
// set node env config
const { env } = require('./config');
const { getFirstWalletPubkey, queryWasm } = require('./cosmjs');
const { getData } = require('./script-execute');
const fs = require('fs');
const writeStream = fs.createWriteStream(process.cwd() + '/debug.log', {
    flags: 'a+'
});

const filterRequest = async (pubkey, request) => {
    if (request && request.merkle_root) {
        return [false, `request already has merkle root`];
    }
    let executorFee = await queryWasm(env.CONTRACT_ADDRESS, JSON.stringify({
        get_participant_fee: {
            pubkey
        }
    }))

    if (request.preference_executor_fee.denom !== executorFee.denom || parseInt(request.preference_executor_fee.amount) < parseInt(executorFee.amount)) {
        return [false, `the request fee is too low. Skip this request`];
    }
    return [true, 'valid request'];
}

const processRequest = async (requestId, mnemonic) => {
    console.log("request id: ", requestId);
    const contractAddr = env.CONTRACT_ADDRESS;
    const executor = await getFirstWalletPubkey(mnemonic);
    // try to collect leaf from backend
    const request = await getRequest(contractAddr, requestId);
    let [filterResult, message] = await filterRequest(executor, request);
    if (!filterResult) {
        console.log(message);
        return;
    }
    else {
        const { submitted } = await checkSubmit(contractAddr, requestId, executor);
        if (submitted) return; // no need to submit again. Wait for other executors
        // get service contracts to get data from the scripts, then submit report
        processData({ contractAddr, requestId, input: request.input, executor, mnemonic });
    }
};

const processRequestAwait = async (requestId, mnemonic) => {
    console.log("request id: ", requestId);
    const contractAddr = env.CONTRACT_ADDRESS;
    const executor = await getFirstWalletPubkey(mnemonic);
    // try to collect leaf from backend
    const request = await getRequest(contractAddr, requestId);
    let [filterResult, message] = await filterRequest(executor, request);
    if (!filterResult) {
        console.log(message);
        return;
    }
    else {
        const { submitted } = await checkSubmit(contractAddr, requestId, executor);
        if (submitted) return; // no need to submit again. Wait for other executors
        // get service contracts to get data from the scripts, then submit report
        await processData({ contractAddr, requestId, input: request.input, executor, mnemonic });
    }
};

const processData = async ({ contractAddr, requestId, input, executor, mnemonic }) => {
    // get service contracts to get data from the scripts, then submit report
    return getData(contractAddr, requestId, input).then(async ([result, reqId]) => {
        const { data, rewards } = result;
        const leaf = {
            executor,
            data,
            rewards
        }
        console.log("request id after getting new leaf data: ", reqId);
        // use req id returned from the getData to preserve the id when getting data
        // check again if has submitted. This is because getting data takes a long time. During this period, another process may have finished already
        // try to collect leaf from backend
        const { submitted } = await checkSubmit(contractAddr, requestId, executor);
        if (!submitted) {
            await submitReport(reqId, leaf, mnemonic);
        }
    }).catch(error => {
        writeStream.write(writeErrorMessage(error), (err) => {
            if (err) console.log("error when appending error to log file: ", err);
        })
    });
}

module.exports = { processRequest, processRequestAwait };
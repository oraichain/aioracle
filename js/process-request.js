const { submitReport, checkSubmit, getRequest } = require('./utils');
// set node env config
const { env } = require('./config');
const { getFirstWalletPubkey } = require('./cosmjs');
const { getData } = require('./script-execute');

const processRequest = async (requestId, mnemonic) => {
    console.log("request id: ", requestId);
    const contractAddr = env.CONTRACT_ADDRESS;
    const executor = await getFirstWalletPubkey(mnemonic);
    // try to collect leaf from backend
    const request = await getRequest(contractAddr, requestId);
    if (request.data && request.data.merkle_root) {
        console.log(`request ${requestId} already has merkle root`);
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
    if (request.data && request.data.merkle_root) {
        console.log(`request ${requestId} already has merkle root`);
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
    }).catch(error => console.log("error in getting data: ", error));
}

module.exports = { processRequest, processRequestAwait };
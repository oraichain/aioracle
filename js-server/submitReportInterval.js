const { env, constants } = require('./config');
const { execute, getLatestBlock } = require('./models/cosmosjs');
const { formTree } = require('./models/merkle-proof-tree');
const { mongoDb } = require('./models/mongo');
const oraiwasmJs = require('./models/oraiwasm');
const { getRequest } = require('./utils');

const processSubmittedRequest = async (requestId, submittedMerkleRoot, localMerkleRoot, leaves) => {
    console.log("merkle root already exists for this request id")
    if (submittedMerkleRoot !== localMerkleRoot) {
        console.log("root is inconsistent. Skip this request");
        return;
    }
    // try inserting the merkle root if does not exist in db
    const merkleRoot = await mongoDb.findMerkleRoot(submittedMerkleRoot);
    if (!merkleRoot) await mongoDb.insertMerkleRoot(submittedMerkleRoot, leaves);
    // try updating the submitted status to true for this request
    const { submitted } = await mongoDb.findRequest(requestId);
    if (!submitted) await mongoDb.updateReportsStatus(requestId);
}

const processUnsubmittedRequests = async (msgs, gasPrices, requestsData) => {
    const latestBlockData = await getLatestBlock();
    const timeoutHeight = parseInt(latestBlockData.block.header.height) + constants.TIMEOUT_HEIGHT;

    // store the merkle root on-chain
    const executeResult = await oraiwasmJs.execute({ childKey: oraiwasmJs.getChildKey(env.MNEMONIC), contractAddr: env.CONTRACT_ADDRESS, rawMessages: msgs, gasPrices, gasLimits: 'auto', timeoutHeight: timeoutHeight, timeoutIntervalCheck: constants.TIMEOUT_INTERVAL_CHECK });
    console.log("execute result: ", executeResult);

    // only store root on backend after successfully store on-chain (can easily recover from blockchain if lose)
    await Promise.all(requestsData.map(async tree => mongoDb.insertMerkleRoot(tree.root, tree.leaves)));

    // update the requests that have been handled in the database
    await mongoDb.bulkUpdateRequests(requestsData, executeResult.tx_response.txhash);
}

const submitReportInterval = async (gasPrices) => {

    // query a list of send data
    const queryResult = await mongoDb.findUnsubmittedRequests();
    console.log("query result: ", queryResult);

    // broadcast send tx & update tx hash
    const msgs = []; // msgs to broadcast to blockchain network
    let requestsData = []; // requests data to store into database
    for (let { reports, requestId, threshold } of queryResult) {
        // only submit merkle root for requests that have enough reports
        if (reports && reports.length === threshold) {
            // form a merkle root based on the value
            let [newRoot, leaves] = await formTree(reports);
            let request = await getRequest(env.CONTRACT_ADDRESS, requestId);
            let root = request.data.merkle_root ? request.data.merkle_root : newRoot;
            if (request.data && request.data.merkle_root) {
                await processSubmittedRequest(requestId, root, newRoot, leaves);
                continue;
            }
            requestsData.push({ requestId, root, leaves });
            msgs.push(Buffer.from(JSON.stringify({ register_merkle_root: { stage: parseInt(requestId), merkle_root: root } })))
        }
    }
    if (msgs.length > 0) {
        // only broadcast new txs if has unfinished reports
        // query latest block
        await processUnsubmittedRequests(msgs, gasPrices, requestsData);
    }
}

module.exports = submitReportInterval;
const { env, constants } = require('./config');
const { formTree } = require('./models/merkle-proof-tree');
const { mongoDb } = require('./models/mongo');
const oraiwasmJs = require('./models/oraiwasm');
const { getRequest, getCurrentDateInfo } = require('./utils');
const { index } = require('./models/elasticsearch/index')

const getLatestBlock = () => {
    return oraiwasmJs.get('/blocks/latest');
}

const processSubmittedRequest = async (requestId, submittedMerkleRoot, localMerkleRoot, leaves) => {
    console.log("merkle root already exists for this request id")
    if (submittedMerkleRoot !== localMerkleRoot) {
        console.log("root is inconsistent. Skip this request");
        return;
    }
    try {
        // try inserting the merkle root if does not exist in db
        const merkleRoot = await mongoDb.findMerkleRoot(submittedMerkleRoot);
        if (!merkleRoot) await mongoDb.insertMerkleRoot(submittedMerkleRoot, leaves);
        // try updating the submitted status to true for this request
        const { submitted } = await mongoDb.findRequest(requestId);
        if (!submitted) await mongoDb.updateReportsStatus(requestId);
    } catch (error) {
        index('process-unsubmitted-request-errors', { error: String(error), ...getCurrentDateInfo() })
    }
}

const processUnsubmittedRequests = async (msgs, gasPrices, requestsData, mnemonic) => {
    try {
        const latestBlockData = await getLatestBlock();
        const timeoutHeight = parseInt(latestBlockData.block.header.height) + constants.TIMEOUT_HEIGHT;

        // store the merkle root on-chain
        const executeResult = await oraiwasmJs.execute({ childKey: oraiwasmJs.getChildKey(mnemonic), rawInputs: msgs, gasPrices, gasLimits: 'auto', timeoutHeight: timeoutHeight, timeoutIntervalCheck: constants.TIMEOUT_INTERVAL_CHECK });
        console.log("execute result: ", executeResult);
        // check error
        if (executeResult.tx_response.txhash) {
            index('submit-merkle-txhash', { txhash: executeResult.tx_response.txhash, ...getCurrentDateInfo() });
            // only store root on backend after successfully store on-chain (can easily recover from blockchain if lose)
            await Promise.all(requestsData.map(async tree => mongoDb.insertMerkleRoot(tree.root, tree.leaves)));

            // update the requests that have been handled in the database
            await mongoDb.bulkUpdateRequests(requestsData, executeResult.tx_response.txhash);
        } else {
            index('submit-merkle-errors', { error: executeResult.message, ...getCurrentDateInfo() });
        }
    } catch (error) {
        index('process-unsubmitted-requests-error', { error: String(error), ...getCurrentDateInfo() });
    }
}

const submitReportInterval = async (gasPrices, mnemonic) => {

    // query a list of send data
    const queryResult = await mongoDb.findUnsubmittedRequests();
    console.log("query result: ", queryResult);

    // broadcast send tx & update tx hash
    const msgs = []; // msgs to broadcast to blockchain network
    let requestsData = []; // requests data to store into database
    for (let { reports, requestId, threshold } of queryResult) {
        // only submit merkle root for requests that have enough reports
        console.log("threshold of the report: ", threshold);
        console.log("reports length: ", reports.length);
        if (reports && reports.length === threshold) {
            // form a merkle root based on the value
            let [newRoot, leaves] = await formTree(reports);
            let request = await getRequest(env.CONTRACT_ADDRESS, requestId);
            let root = request.data.merkle_root ? request.data.merkle_root : newRoot;
            // if the request already has merkle root stored on-chain, then we only update our db accordingly
            if (request.data && request.data.merkle_root) {
                await processSubmittedRequest(requestId, root, newRoot, leaves);
                continue;
            }
            requestsData.push({ requestId, root, leaves });
            const msg = { contractAddr: env.CONTRACT_ADDRESS, message: Buffer.from(JSON.stringify({ register_merkle_root: { stage: parseInt(requestId), merkle_root: root } })) };
            msgs.push(msg)
        } else if (reports && reports.length > threshold) {
            // update the reports so they have equal threshold. No need to await this
            reports = reports.slice(0, threshold - 1);
            mongoDb.updateOrInsertReports(parseInt(requestId), reports, threshold);
        }
    }
    if (msgs.length > 0) {
        // only broadcast new txs if has unfinished reports
        // query latest block
        await processUnsubmittedRequests(msgs, gasPrices, requestsData, mnemonic);
    }
}

module.exports = submitReportInterval;
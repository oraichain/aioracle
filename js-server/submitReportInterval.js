const { env, constants } = require('./config');
const { formTree } = require('./models/merkleTree');
const { getRequest, getCurrentDateInfo } = require('./utils');
const { broadcastMerkleRoot } = require('./ws');
const { execute } = require('./models/cosmjs')

const processSubmittedRequest = async (requestId, submittedMerkleRoot, localMerkleRoot, leaves, mongoDb) => {
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
        console.log("error in process submitted request: ", JSON.stringify(error));
        // index('process-submitted-request-errors', { error: JSON.stringify(error), ...getCurrentDateInfo() })
    }
}

const processUnsubmittedRequests = async (msgs, gasPrices, requestsData, mnemonic, mongoDb) => {
    try {
        // const latestBlockData = await getLatestBlock();
        // const timeoutHeight = parseInt(latestBlockData.block.header.height) + constants.TIMEOUT_HEIGHT;

        // broadcast merkle root to all ws clients. ws is used to reduce time waiting for merkle root to be submitted on-chain
        broadcastMerkleRoot(requestsData);

        // store the merkle root on-chain
        const executeResult = await execute({
            mnemonic,
            address: env.CONTRACT_ADDRESS,
            msgs,
            memo: "",
            gasData: { gasAmount: gasPrices, denom: "orai" },
        });
        console.log("execute result: ", executeResult);
        // check error
        if (executeResult.tx_response.txhash) {
            // only store root on backend after successfully store on-chain (can easily recover from blockchain if lose)
            await Promise.all(requestsData.map(async tree => mongoDb.insertMerkleRoot(tree.root, tree.leaves)));

            // update the requests that have been handled in the database
            await mongoDb.bulkUpdateRequests(requestsData, executeResult.tx_response.txhash);
        } else {
            console.log("error in submitting merkle root: ", executeResult.message);
            // index('submit-merkle-errors', { error: executeResult.message, ...getCurrentDateInfo() });
        }
    } catch (error) {
        console.log("error in process unsubmitted requests: ", error);
        // index('process-unsubmitted-requests-error', { error: JSON.stringify(error), ...getCurrentDateInfo() });
    }
}

const submitReportInterval = async (gasPrices, mnemonic, mongoDb) => {

    // query a list of send data
    const queryResult = await mongoDb.findUnsubmittedRequests();
    console.log("query result: ", queryResult);

    // broadcast send tx & update tx hash
    const msgs = []; // msgs to broadcast to blockchain network
    let requestsData = []; // requests data to store into database
    for (let { requestId, threshold } of queryResult) {
        const reportCount = await mongoDb.countExecutorReports(requestId);
        console.log("request id with report count and threshold: ", { requestId, reportCount, threshold });
        // only submit merkle root for requests that have enough reports
        if (reportCount === threshold) {
            // query a list of reports from the request id
            const reports = await mongoDb.queryExecutorReportsWithThreshold(requestId, threshold);
            // form a merkle root based on the value
            let [newRoot, leaves] = await formTree(reports);
            let request = await getRequest(env.CONTRACT_ADDRESS, requestId);
            let root = request.data.merkle_root ? request.data.merkle_root : newRoot;
            // if the request already has merkle root stored on-chain, then we only update our db accordingly
            if (request.data && request.data.merkle_root) {
                await processSubmittedRequest(requestId, root, newRoot, leaves, mongoDb);
                continue;
            }
            requestsData.push({ requestId, root, leaves });

            // collect the executor list from report to push to contract
            const executors = reports.map(report => report.executor);
            const msg = { contractAddress: env.CONTRACT_ADDRESS, msg: { register_merkle_root: { stage: parseInt(requestId), merkle_root: root, executors } } };
            msgs.push(msg)
        } else if (reportCount < threshold) {
            // in case report length is smaller than threshold, consider removing it if there exists a finished request in db
            const { submitted } = await mongoDb.findSubmittedRequest(requestId);
            if (submitted) await mongoDb.removeRedundantRequests(requestId);
        } else if (reportCount > threshold) {
            let numRedundant = reportCount - threshold;
            // update the reports so they have equal threshold
            await mongoDb.updateReports(parseInt(requestId), numRedundant);
        }
    }
    if (msgs.length > 0) {
        // only broadcast new txs if has unfinished reports
        // query latest block
        await processUnsubmittedRequests(msgs, gasPrices, requestsData, mnemonic, mongoDb);
    }
}

module.exports = submitReportInterval;
const { env, constants } = require('./config');
const { execute, getLatestBlock } = require('./models/cosmosjs');
const { formTree } = require('./models/merkle-proof-tree');
const insertMerkleRoot = require('./models/mongo/InsertMerkleRoot');
const { updateReportsStatus } = require('./models/mongo/updateReports');
const client = require('./mongo');
const { getRequest } = require('./utils');

const submitReportInterval = async (gasPrices) => {
    // query a list of send data
    await client.connect();
    const db = client.db(env.CONTRACT_ADDRESS);
    const collection = db.collection(constants.REQUESTS_COLLECTION);
    // only find requests with null txhash
    const queryResult = await collection.find({ submitted: null, threshold: { $ne: null } }).limit(10).sort({ requestId: -1 }).toArray();
    console.log("query result: ", queryResult);

    // broadcast send tx & update tx hash
    const msgs = [];
    let bulkUpdateOps = [];
    let requestsData = [];
    for (let { reports, requestId, threshold } of queryResult) {
        // only submit merkle root for requests that have enough reports
        if (reports && reports.length === threshold) {
            // form a merkle root based on the value
            let [newRoot, leaves] = await formTree(reports);
            let request = await getRequest(env.CONTRACT_ADDRESS, requestId);
            let root = request.data.merkle_root ? request.data.merkle_root : newRoot;
            if (request.data && request.data.merkle_root) {
                console.log("merkle root already exists for this request id")
                if (request.data.merkle_root !== newRoot) {
                    console.log("root is inconsistent. Skip this request");
                    continue;
                }
                // TODO: query if already has merkle root
                // try inserting the merkle root if does not exist in db
                await insertMerkleRoot(env.CONTRACT_ADDRESS, root, leaves);
                // TODO: query if already has status submitted
                // try updating the submitted status to true for this request
                await updateReportsStatus(env.CONTRACT_ADDRESS, requestId);
                continue;
            }
            requestsData.push({ requestId: requestId, root, leaves });
            msgs.push(Buffer.from(JSON.stringify({ register_merkle_root: { stage: parseInt(requestId), merkle_root: root } })))
        }
    }
    if (msgs.length > 0) {
        // only broadcast new txs if has unfinished reports
        // query latest block
        const latestBlockData = await getLatestBlock();
        const timeoutHeight = parseInt(latestBlockData.block.header.height) + constants.TIMEOUT_HEIGHT;

        // store the merkle root on-chain
        const executeResult = await execute({ mnemonic: env.MNEMONIC, contractAddr: env.CONTRACT_ADDRESS, rawMessages: msgs, gasPrices, gasLimits: constants.GAS_LIMITS, timeoutHeight: timeoutHeight, timeoutIntervalCheck: constants.TIMEOUT_INTERVAL_CHECK });
        console.log("execute result: ", executeResult);

        // only store root on backend after successfully store on-chain (can easily recover from blockchain if lose)
        await Promise.all(requestsData.map(async tree => insertMerkleRoot(env.CONTRACT_ADDRESS, tree.root, tree.leaves)));

        for (let { requestId } of requestsData) {
            bulkUpdateOps.push({
                "updateOne": {
                    "filter": { requestId },
                    "update": { "$set": { "txhash": executeResult.tx_response.txhash, "submitted": true } }
                }
            })
        }

        const bulkResult = await collection.bulkWrite(bulkUpdateOps);
        console.log("bulk result: ", bulkResult);
    }
}

module.exports = submitReportInterval;
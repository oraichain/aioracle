
const db = require('../db');
const {
    formTree,
} = require('../models/merkle-proof-tree');
// const { execute } = require('../models/cosmjs');
const { getRequest, handleResponse, isWhiteListed, verifySignature } = require('../utils');
const { env } = require('../config');
const execute = require('../models/cosmosjs');
const findReports = require('../models/mongo/find-reports');
const updateOrInsertReports = require('../models/mongo/update-reports');
const insertMerkleRoot = require('../models/mongo/insert-merkle-root');

const submitReport = async (req, res) => {
    let { requestId, report } = req.body;
    const contractAddr = env.CONTRACT_ADDRESS;
    const wallet = env.MNEMONIC;

    // collect current request id that we need to handle
    let threshold = 0;
    try {
        let data = await getRequest(contractAddr, requestId);
        // verify executor not in list
        if (!(await isWhiteListed(contractAddr, report.executor, data.data.executors_key))) return handleResponse(res, 401, "not in list");
        threshold = data.data.threshold;
    } catch (error) {
        return handleResponse(res, 500, error.toString());
    }

    const { signature, ...rawReport } = report;
    // verify report signature
    let rawMessage = {
        requestId,
        report: rawReport
    }
    if (!verifySignature(Buffer.from(JSON.stringify(rawMessage), 'ascii'), Buffer.from(signature, 'base64'), Buffer.from(report.executor, 'base64'))) return handleResponse(res, 403, "Invalid report signature");

    let key = `${contractAddr}${requestId.toString()}`;
    console.log("current request id handling: ", requestId);

    try {

        let reports = [];
        // const data = await db.get(key);
        reports = await findReports(contractAddr, parseInt(requestId));
        console.log("reports: ", reports);
        // if we cant find the request id, we init new
        if (!reports) reports = [report];
        else if (reports.filter(rep => rep.executor === report.executor).length === 0) {
            // append into the existing value if not submitted
            reports.push(report);
        }

        if (reports.length < threshold) {
            // await db.put(key, JSON.stringify(reports));
            await updateOrInsertReports(contractAddr, parseInt(requestId), reports);
            return handleResponse(res, 200, "success");
        }
        else if (reports.length === threshold) {
            // if root already exists return
            let root = await getRequest(contractAddr, requestId);
            if (root.data && root.data.merkle_root) {
                return handleResponse(res, 403, "merkle root already exists for this request id");
            }

            // form a merkle root based on the value
            let [newRoot, leaves] = await formTree(reports);
            root = newRoot;

            // store the merkle root on-chain
            const executeResult = await execute({ mnemonic: wallet, contractAddr, message: JSON.stringify({ register_merkle_root: { stage: parseInt(requestId), merkle_root: root } }), fees: 0, gasLimits: 20000000 });

            console.log("request id after finish executing result: ", requestId);
            console.log("execute result: ", executeResult);

            // only store reports when the merkle root is successfully stored on-chain.
            await updateOrInsertReports(contractAddr, parseInt(requestId), reports);
            // only store root on backend after successfully store on-chain (can easily recover from blockchain if lose)
            // await db.put(Buffer.from(root, 'hex'), leaves);
            await insertMerkleRoot(contractAddr, root, leaves);

            return handleResponse(res, 200, "success");
        }
        else return handleResponse(res, 403, "request has already finished");
    } catch (error) {
        return handleResponse(res, 500, String(error));
    }
}

module.exports = { submitReport };
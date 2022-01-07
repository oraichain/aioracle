
const db = require('./db');
const {
    formTree,
} = require('./merkle-proof-tree');
const { execute } = require('./cosmjs');
const { getRequest, getCurrentStage, handleResponse, isWhiteListed } = require('./utils');

const submitReport = async (req, res) => {
    let report = req.body;
    const contractAddr = process.env.CONTRACT_ADDRESS;
    const wallet = process.env.MNEMONIC;
    // invalid data format
    if (!report.executor || !report.data) return handleResponse(res, 403, "wrong input format");

    // collect current request id that we need to handle
    let requestId = 0;
    let threshold = 0;
    try {
        requestId = await getCurrentStage(contractAddr);
        let data = await getRequest(contractAddr, requestId);
        // verify executor not in list
        if (!(await isWhiteListed(contractAddr, report.executor, data.data.executors_key))) return handleResponse(res, 401, "not in list");
        threshold = data.data.threshold;
    } catch (error) {
        return handleResponse(res, 500, error.toString());
    }

    let key = `${contractAddr}${requestId.toString()}`;
    let reports = [];
    try {
        const data = await db.get(key);
        reports = JSON.parse(data);
        if (reports.filter(rep => rep.executor === report.executor).length === 0) {
            // append into the existing value if not submitted
            reports.push(report);
        }
    } catch (error) {
        // if we cant find the request id, we init new
        reports = [report];
    }
    if (reports.length < threshold) {
        await db.put(key, JSON.stringify(reports));
        return handleResponse(res, 200, "success");
    }
    else if (reports.length === threshold) {
        await db.put(key, JSON.stringify(reports));

        // if root already exists return
        let root = await getRequest(contractAddr, requestId);
        if (root.data && root.data.merkle_root) {
            return handleResponse(res, 403, "merkle root already exists for this request id");
        }

        // form a merkle root based on the value
        root = await formTree(reports);

        // store the merkle root on-chain
        const executeResult = await execute({ mnemonic: wallet, address: contractAddr, handleMsg: JSON.stringify({ register_merkle_root: { merkle_root: root } }), gasData: { gasAmount: "0", denom: "orai" } });

        console.log("execute result: ", executeResult);

        return handleResponse(res, 200, "success");
    }
    else return handleResponse(res, 403, "request has already finished");
}

module.exports = { submitReport };
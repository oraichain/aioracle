
const db = require('./db');
const {
    MerkleProofTree,
    sha256,
} = require('./merkle-proof-tree');
const { execute } = require('./cosmjs');
const http = require('http');
const { getRoot, getCurrentStage } = require('./utils');

const threshold = 4;
const whiteList = ["orai10dzr3yks2jrtgqjnpt6hdgf73mnset024k2lzy", "orai16e6cpk6ycddk6208fpaya7tmmardhvr77l5dtr", "orai1uhcwtfntsvk8gpwfxltesyl4e28aalmqvx7typ", "orai1f6q9wjn8qp3ll8y8ztd8290vtec2yxyx0wnd0d", "orai18tf4uwrkcd4qk87jz3n0ruhsdzeg3fmde8x8yj"];

const submitReport = async (req, res) => {
    let report = req.body;
    // invalid data format
    if (!report.executor || !report.data) return res.status(403).send({ code: http.STATUS_CODES['403'], message: "wrong input format" })
    // not in list
    if (!whiteList.includes(report.executor)) return res.status(401).send({ code: http.STATUS_CODES['401'] })

    // collect current request id that we need to handle
    let requestId = 0;
    try {
        requestId = await getCurrentStage();
    } catch (error) {
        return res.status(500).send({ code: http.STATUS_CODES['500'] })
    }

    let countKey = `${requestId}_report_count`;
    let requestIdString = requestId.toString();
    let reports = [];
    try {
        const data = await db.get(requestIdString);
        reports = JSON.parse(data);
        console.log("reports: ", reports);
        // filter report.if already submitted => reject
        if (reports.filter(rep => rep.executor === report.executor).length > 0) {
            return res.status(403).send({ code: http.STATUS_CODES['403'] })
        }
        // otherwise we append into the existing value
        reports.push(report);
    } catch (error) {
        // if we cant find the request id, we init new
        reports = [report];
    }
    // only allow adding into db if <= threshold
    let count = 1;
    try {
        // increment count
        count = await db.get(countKey);
        count++;
    } catch (error) {
    }
    console.log("count value: ", count);
    if (count + 1 <= threshold) {
        await db.put(requestIdString, JSON.stringify(reports));
        await db.put(countKey, count.toString());
    }
    if (count === threshold) {
        // if root already exists return
        let root = await getRoot(requestId);
        console.log("root: ", root);
        if (root.data) return res.status(403).send({ code: http.STATUS_CODES['403'], message: "merkle root already exists for this request id" });

        // form a merkle root based on the value
        const values = reports.map(JSON.stringify);
        const leaves = values.map((value) => sha256(value).toString('hex'));

        const tree = new MerkleProofTree(leaves);

        // store the leaves to retrieve later. Can possibly store this on contract (but could be expensive)
        await db.put(tree.getRoot(), JSON.stringify(leaves));
        await Promise.all(values.map((value, i) => db.put(leaves[i], value)));

        console.log('save data in', tree.getHexRoot());

        // store the merkle root on-chain
        const executeResult = await execute({ mnemonic: process.env.MNEMONIC, address: process.env.CONTRACT_ADDRESS, handleMsg: JSON.stringify({ register_merkle_root: { merkle_root: tree.getHexRoot() } }), gasData: { gasAmount: "0", denom: "orai" } });

        console.log("execute result: ", executeResult);
        return res.send({ code: http.STATUS_CODES['200'] });
    }
    if (count < threshold) return res.status(200).send({ code: http.STATUS_CODES['200'] });
    return res.status(403).send({ code: http.STATUS_CODES['403'], message: "request has already finished" });
}

module.exports = { submitReport };
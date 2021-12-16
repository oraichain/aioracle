
const db = require('./db');
const {
    MerkleProofTree,
    sha256,
    verifyHexProof
} = require('./merkle-proof-tree');
const { execute } = require('./cosmjs');
const http = require('http');

const threshold = 2;
const whiteList = ["orai10dzr3yks2jrtgqjnpt6hdgf73mnset024k2lzy", "orai16e6cpk6ycddk6208fpaya7tmmardhvr77l5dtr"];

const submitReport = (req, res) => {
    let report = req.body;
    // invalid data format
    if (!report.executor || !report.request_id || !report.data) return res.status(403).send({ code: http.STATUS_CODES['403'] })
    // not in list
    if (!whiteList.includes(report.executor)) return res.status(401).send({ code: http.STATUS_CODES['401'] })
    let countKey = `${report.request_id}_report_count`;
    let requestIdString = report.request_id.toString();
    db.get(requestIdString, async (error, value) => {
        let reports = [];
        // if we cant find the request id, we init new
        if (error) {
            reports = [report.data];
        } else {
            // TODO: filter report. if already submitted => reject
            reports = JSON.parse(value);
            // otherwise we append into the existing value
            reports.push(report.data);
        }
        // only allow adding into db if <= threshold
        let count = 1;
        try {
            // increment count
            count = await db.get(countKey);
            count++;
        } catch (error) {
        }
        console.log("count: ", count);
        console.log("reports: ", reports);
        if (count + 1 <= threshold) await db.put(requestIdString, JSON.stringify(reports));
        await db.put(countKey, count.toString());
        if (count === threshold) {
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
        } else if (count < threshold) return res.status(200).send({ code: http.STATUS_CODES['200'] });
        else return res.status(403).send({ code: http.STATUS_CODES['403'], message: "request has already finished" });
    })
}

module.exports = { submitReport };
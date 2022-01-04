
const db = require('./db');
const {
    MerkleProofTree,
    sha256,
} = require('./merkle-proof-tree');
const { execute } = require('./cosmjs');
const http = require('http');
const { getRoot, getCurrentStage } = require('./utils');

// const threshold = 4;
const whiteList = ["orai10dzr3yks2jrtgqjnpt6hdgf73mnset024k2lzy", "orai16e6cpk6ycddk6208fpaya7tmmardhvr77l5dtr", "orai1uhcwtfntsvk8gpwfxltesyl4e28aalmqvx7typ", "orai1f6q9wjn8qp3ll8y8ztd8290vtec2yxyx0wnd0d", "orai18tf4uwrkcd4qk87jz3n0ruhsdzeg3fmde8x8yj", "orai1602dkqjvh4s7ryajnz2uwhr8vetrwr8nekpxv5", "orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573"];

const submitReport = async (req, res) => {
    let report = req.body;
    const contractAddr = process.env.CONTRACT_ADDRESS;
    const wallet = process.env.MNEMONIC;
    // invalid data format
    if (!report.executor || !report.data) return res.status(403).send({ code: http.STATUS_CODES['403'], message: "wrong input format" })
    // not in list
    if (!whiteList.includes(report.executor)) return res.status(401).send({ code: http.STATUS_CODES['401'] })

    // collect current request id that we need to handle
    let requestId = 0;
    let threshold = 0;
    try {
        requestId = await getCurrentStage(contractAddr);
        let data = await getRoot(contractAddr, requestId);
        threshold = data.data.threshold;
    } catch (error) {
        return res.status(500).send({ code: http.STATUS_CODES['500'], error })
    }

    let key = `${contractAddr}${requestId.toString()}`;
    let countKey = `${key}_report_count`;
    let reports = [];
    try {
        const data = await db.get(key);
        reports = JSON.parse(data);
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
    if (count <= threshold) {
        await db.put(key, JSON.stringify(reports));
        await db.put(countKey, count.toString());
    }
    if (count === threshold) {
        // if root already exists return
        let root = await getRoot(contractAddr, requestId);
        console.log("root: ", root);
        if (root.data && root.data.merkle_root) return res.status(403).send({ code: http.STATUS_CODES['403'], message: "merkle root already exists for this request id" });

        // form a merkle root based on the value
        const values = reports.map(JSON.stringify);
        const leaves = values.map((value) => sha256(value).toString('hex'));

        const tree = new MerkleProofTree(leaves);

        // store the leaves to retrieve later. Can possibly store this on contract (but could be expensive)
        await db.put(tree.getRoot(), JSON.stringify(leaves));
        await Promise.all(values.map((value, i) => db.put(leaves[i], value)));

        console.log('save data in', tree.getHexRoot());

        // store the merkle root on-chain
        const executeResult = await execute({ mnemonic: wallet, address: contractAddr, handleMsg: JSON.stringify({ register_merkle_root: { merkle_root: tree.getHexRoot() } }), gasData: { gasAmount: "0", denom: "orai" } });

        return res.send({ code: http.STATUS_CODES['200'] });
    }
    if (count < threshold) return res.status(200).send({ code: http.STATUS_CODES['200'] });
    return res.status(403).send({ code: http.STATUS_CODES['403'], message: "request has already finished" });
}

module.exports = { submitReport };
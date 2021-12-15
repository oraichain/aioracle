require('dotenv').config()
const {
  MerkleProofTree,
  sha256,
  verifyHexProof
} = require('./merkle-proof-tree');
const level = require('level');
const { execute } = require('./cosmjs');
const http = require('http');

const express = require('express')
const app = express()
const port = 3000
app.use(express.json()); // built-in middleware for express

// root: 5cb7c54b6004e75cc859c4c0c33b1f8fee63c15ba0c5cf3556a5e3d5bbd69455

const db = level('merkle-proof');

const threshold = 2;
const whiteList = ["orai10dzr3yks2jrtgqjnpt6hdgf73mnset024k2lzy", "orai16e6cpk6ycddk6208fpaya7tmmardhvr77l5dtr"];

app.get('/get_proof', async (req, res) => {
  let rootHex = req.body.rootHex;
  let leaf = req.body.leaf;
  const keys = JSON.parse((await db.get(Buffer.from(rootHex, 'hex'))));
  const leaves = [];
  for (let i = 0; i < keys.length; i++) {
    leaves.push(Buffer.from(keys[i], 'hex'));
  }
  const tree = new MerkleProofTree(leaves);

  const hexLeaf = sha256(JSON.stringify(leaf)).toString('hex');

  const proofs = tree.getHexProof(hexLeaf);
  if (proofs.length === 0) return res.send({ code: 404 });
  return res.send({ code: 200, proofs })
})

app.post('/submit_report', (req, res) => {
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
      if (count + 1 <= threshold) await db.put(requestIdString, JSON.stringify(reports));
      count++;
    } catch (error) {
    }
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
    }
    return res.status(403).send({ code: http.STATUS_CODES['200'], message: "request has already finished" });
  })
})

app.listen(port, async () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

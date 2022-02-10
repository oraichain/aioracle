const { env } = require('../config');
const db = require('../db');
const {
    MerkleProofTree,
    sha256,
} = require('../models/merkle-proof-tree');
const { MongoDb } = require('../models/mongo');
const { getRequest } = require('../utils');

const getProof = async (req, res) => {
    let { request_id: requestId, leaf, contract_addr: contractAddr } = req.body;
    // let contractAddr = env.CONTRACT_ADDRESS;
    const mongoDb = new MongoDb(contractAddr);
    try {
        // collect the root hex based on the request id to form a tree
        let { data } = await getRequest(contractAddr, requestId);
        if (!data.merkle_root) return res.status(200).send({ code: 200, message: "Waiting for the merkle root" })
        // const leaves = JSON.parse((await db.get(Buffer.from(data.merkle_root, 'hex'))));
        const leaves = await mongoDb.findLeaves(data.merkle_root);
        const tree = new MerkleProofTree(leaves);
        const hexLeaf = sha256(JSON.stringify(leaf));

        const root = tree.getHexRoot();
        // special case, tree with only root
        if (hexLeaf.toString('hex') === root) return res.send({ code: 200, proofs: [], root: tree.getHexRoot() })
        const proofs = tree.getHexProof(hexLeaf);
        if (proofs.length === 0 && root !== hexLeaf.toString('hex')) return res.send({ code: 404 });
        return res.send({ code: 200, proofs, root: root })
    } catch (error) {
        console.log("error: ", error);
        return res.status(404).send({ code: 404, error: String(error) })
    }
}
module.exports = { getProof };
const { env } = require('../config');
const db = require('../db');
const {
    MerkleProofTree,
    sha256,
} = require('../models/merkle-proof-tree');
const { getRequest, getCurrentStage } = require('../utils');

const getProof = async (req, res) => {
    let { requestId, leaf } = req.body;
    console.log("leaf: ", leaf);
    let contractAddr = env.CONTRACT_ADDRESS;
    try {
        // collect the root hex based on the request id to form a tree
        let { data } = await getRequest(contractAddr, requestId);
        if (!data.merkle_root) return res.status(200).send({ code: 200, message: "Waiting for the merkle root" })
        const leaves = JSON.parse((await db.get(Buffer.from(data.merkle_root, 'hex'))));
        const tree = new MerkleProofTree(leaves);
        const hexLeaf = sha256(JSON.stringify(leaf));
        console.log("hex leaf: ", hexLeaf.toString('hex'));

        const root = tree.getHexRoot();
        // special case, tree with only root
        if (hexLeaf.toString('hex') === root) return res.send({ code: 200, proofs: [], root: tree.getHexRoot() })
        const proofs = tree.getHexProof(hexLeaf);
        console.log("root: ", root);
        console.log("proofs: ", proofs);
        if (proofs.length === 0 && root !== hexLeaf.toString('hex')) return res.send({ code: 404 });
        return res.send({ code: 200, proofs, root: root })
    } catch (error) {
        console.log("error: ", error);
        return res.status(404).send({ code: 404, error })
    }
}
module.exports = { getProof };
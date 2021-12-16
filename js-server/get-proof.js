const db = require('./db');
const {
    MerkleProofTree,
    sha256,
} = require('./merkle-proof-tree');

const getProof = async (req, res) => {
    let rootHex = req.body.rootHex;
    let leaf = req.body.leaf;
    try {
        const keys = JSON.parse((await db.get(Buffer.from(rootHex, 'hex'))));
        const leaves = [];
        for (let i = 0; i < keys.length; i++) {
            leaves.push(Buffer.from(keys[i], 'hex'));
        }
        const tree = new MerkleProofTree(leaves);

        const hexLeaf = sha256(JSON.stringify(leaf)).toString('hex');

        const proofs = tree.getHexProof(hexLeaf);
        console.log("proofs: ", proofs);
        console.log("leaf data: ", JSON.stringify(JSON.stringify(leaf)));
        if (proofs.length === 0) return res.send({ code: 404 });
        return res.send({ code: 200, proofs })
    } catch (error) {
        return res.status(404).send({ code: 404 })
    }
}

module.exports = { getProof };
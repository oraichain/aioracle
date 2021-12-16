const db = require('./db');
const {
    MerkleProofTree,
    sha256,
} = require('./merkle-proof-tree');
const { getRoot } = require('./utils');

const getProof = async (req, res) => {
    console.log("request body: ", req.body);
    let leaf = req.body;
    try {
        // collect the root hex based on the request id to form a tree
        let { merkle_root } = (await getRoot(req.body.request_id)).data;
        const keys = JSON.parse((await db.get(Buffer.from(merkle_root, 'hex'))));
        const leaves = [];
        for (let i = 0; i < keys.length; i++) {
            leaves.push(Buffer.from(keys[i], 'hex'));
        }
        const tree = new MerkleProofTree(leaves);
        const hexLeaf = sha256(JSON.stringify(leaf)).toString('hex');
        const proofs = tree.getHexProof(hexLeaf);
        if (proofs.length === 0) return res.send({ code: 404 });
        return res.send({ code: 200, proofs })
    } catch (error) {
        console.log("error: ", error);
        return res.status(404).send({ code: 404 })
    }
}

module.exports = { getProof };
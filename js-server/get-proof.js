const db = require('./db');
const {
    MerkleProofTree,
    sha256,
} = require('./merkle-proof-tree');
const { getRoot, getCurrentStage } = require('./utils');

const getProof = async (req, res) => {
    let leaf = req.body;
    let contractAddr = process.env.CONTRACT_ADDRESS;
    try {
        // collect the root hex based on the request id to form a tree
        const requestId = await getCurrentStage(contractAddr);
        let { data } = await getRoot(contractAddr, requestId);
        if (!data.merkle_root) return res.status(200).send({ code: 200, message: "Waiting for the merkle root" })
        const keys = JSON.parse((await db.get(Buffer.from(data.merkle_root, 'hex'))));
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
        return res.status(404).send({ code: 404, error })
    }
}

module.exports = { getProof };
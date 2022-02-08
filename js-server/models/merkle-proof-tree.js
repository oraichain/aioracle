const { MerkleTree } = require('merkletreejs');
const crypto = require('crypto');
const db = require('../db');

const sha256 = (data) => crypto.createHash('sha256').update(data).digest();
const verifyHexProof = (hexLeaf, hexProof, hexRoot) => {
  const leaf = Buffer.from(hexLeaf, 'hex');
  const proof = hexProof.map((hex) => Buffer.from(hex, 'hex'));
  const hashBuf = proof.reduce(
    (hashBuf, proofBuf) =>
      sha256(Buffer.concat([hashBuf, proofBuf].sort(Buffer.compare))),
    leaf
  );

  return hexRoot === hashBuf.toString('hex');
};

const formTree = async (reports) => {
  const values = reports.map(report => JSON.stringify({ ...report, data: sha256(report.data).toString('hex') })); // hash data to reduce tx fee when claiming rewards
  const leaves = values.map((value) => sha256(value).toString('hex'));
  // store the leaves to retrieve later. Can possibly store this on contract (but could be expensive)
  const tree = new MerkleProofTree(leaves);
  // await db.put(Buffer.from(tree.getHexRoot(), 'hex'), JSON.stringify(leaves));
  return [tree.getHexRoot(), JSON.stringify(leaves)];
}

class MerkleProofTree extends MerkleTree {
  constructor(leaves) {
    super(leaves, undefined, { sort: true });
  }

  getHexProof(leaf, index) {
    return super.getHexProof(leaf, index).map((x) => x.substring(2));
  }

  getHexRoot() {
    return super.getHexRoot().substring(2);
  }

  getHexLeaves() {
    return super.getHexLeaves().map((x) => x.substring(2));
  }
}

module.exports = { sha256, verifyHexProof, formTree, MerkleProofTree };

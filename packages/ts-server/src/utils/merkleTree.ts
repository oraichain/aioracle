import { MerkleTree } from 'merkletreejs';
import * as crypto from 'crypto';

export class MerkleProofTree extends MerkleTree {
  constructor(leaves) {
    super(leaves, undefined, { sort: true });
  }

  getHexProof(leaf: Buffer | string, index?: number) {
    return super.getHexProof(leaf, index).map((x) => x.substring(2));
  }

  getHexRoot() {
    return super.getHexRoot().substring(2);
  }

  getHexLeaves() {
    return super.getHexLeaves().map((x) => x.substring(2));
  }
}

export function sha256(data) {
  return crypto.createHash('sha256').update(data).digest();
}

export async function formTree(reports) {
  const values = reports.map(({ report }) =>
    JSON.stringify({
      ...report,
      data: sha256(report.data).toString('hex')
    })
  );
  const leaves = values.map((value) => sha256(value).toString('hex'));
  // store the leaves to retrieve later. Can possibly store this on contract (but could be expensive)
  const tree = new MerkleProofTree(leaves);
  return [tree.getHexRoot(), JSON.stringify(leaves)];
}

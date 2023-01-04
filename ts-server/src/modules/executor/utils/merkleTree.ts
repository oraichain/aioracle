import { MerkleTree } from 'merkletreejs';
import crypto from 'crypto';

export class MerkleProofTree extends MerkleTree {
  constructor(leaves) {
    super(leaves, undefined, { sort: true });
  }

  getHexProof(leaf, index=0) {
    return super.getHexProof(leaf, index).map((x) => x.substring(2));
  }

  getHexRoot() {
    return super.getHexRoot().substring(2);
  }

  getHexLeaves() {
    return super.getHexLeaves().map((x) => x.substring(2));
  }
}

export function sha256 (data) {
  return crypto.createHash('sha256').update(data).digest();
}

export type Uint64 = number | string;
export class MerkleRootMsg {
  stage: Uint64;
  merkle_root: string;
  executors: string[];
}

export class MerkleRootExecuteMsg {
  contractAddress: string;
  msg: {
    register_merkle_root: MerkleRootMsg
  };
}

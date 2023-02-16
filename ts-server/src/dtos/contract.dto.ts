export type HumanAddr = string;
export type Uint64 = number | string;
export type Binary = string;

export class MerkleRootMsg {
  stage: Uint64;
  merkle_root: string;
  executors: Binary[];
}

export class MerkleRootExecuteMsg {
  contractAddress: HumanAddr;
  msg: {
    register_merkle_root: MerkleRootMsg
  };
}

export type Binary = string;
export type Addr = string;
export type Uint128 = string;
export interface UpdateConfigMsg {
  new_checkpoint?: number | null;
  new_checkpoint_threshold?: number | null;
  new_executors?: Binary[] | null;
  new_max_req_threshold?: number | null;
  new_owner?: Addr | null;
  old_executors?: Binary[] | null;
}
export interface Coin {
  amount: Uint128;
  denom: string;
}
export interface Config {
  max_req_threshold: number;
  owner: Addr;
}
export interface Executor {
  is_active: boolean;
  left_block?: number | null;
  pubkey: Binary;
}
export type Uint64 = number;
export type ArrayOfExecutor = Executor[];
export type Boolean = boolean;
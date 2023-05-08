export type HandleMsg = {
  change_state: {
    aioracle_addr?: HumanAddr | null;
    base_reward?: Coin | null;
    max_reward_claim?: Uint128 | null;
    owner?: HumanAddr | null;
    ping_jump?: number | null;
    ping_jump_interval?: number | null;
  };
} | {
  ping: {
    pubkey: Binary;
  };
} | {
  claim_reward: {
    pubkey: Binary;
  };
};
export type HumanAddr = string;
export type Uint128 = string;
export type Binary = string;
export interface Coin {
  amount: Uint128;
  denom: string;
}
export interface InitMsg {
  aioracle_addr: HumanAddr;
  base_reward: Coin;
  ping_jump: number;
}
export interface UpdateConfigMsg {
  new_checkpoint?: number | null;
  new_checkpoint_threshold?: number | null;
  new_contract_fee?: Coin | null;
  new_denom?: string | null;
  new_executors?: Binary[] | null;
  new_max_req_threshold?: number | null;
  new_owner?: HumanAddr | null;
  new_pending_period?: number | null;
  new_service_addr?: HumanAddr | null;
  new_slashing_amount?: number | null;
  new_trust_period?: number | null;
  old_executors?: Binary[] | null;
}
export interface Executor {
  executing_power: number;
  index: number;
  is_active: boolean;
  left_block?: number | null;
  pubkey: Binary;
}
export interface TrustingPool {
  amount_coin: Coin;
  withdraw_amount_coin: Coin;
  withdraw_height: number;
}
export interface UpdateContractMsg {
  creator?: HumanAddr | null;
  governance?: HumanAddr | null;
}
export interface PagingFeesOptions {
  limit?: number | null;
  offset?: string | null;
  order?: number | null;
}
export interface StateMsg {
  language?: string | null;
  parameters?: string[] | null;
  script_url?: string | null;
}
export interface State {
  language: string;
  parameters: string[];
  script_url: string;
}
export interface TestCaseMsg {
  expected_output: string;
  parameters: string[];
}
export interface Contracts {
  dsources: HumanAddr[];
  oscript: HumanAddr;
  tcases: HumanAddr[];
}
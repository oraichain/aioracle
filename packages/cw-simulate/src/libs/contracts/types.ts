export type Uint128 = string;
export type HumanAddr = string;
export interface Coin {
  amount: Uint128;
  denom: string;
}
export type Binary = string;
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
export type HandleMsg = {
  set_state: StateMsg;
} | {
  set_service_fees: {
    contract_addr: HumanAddr;
    fee: Coin;
  };
} | {
  withdraw_fees: {
    fee: Coin;
  };
} | {
  set_owner: {
    owner: string;
  };
};
export interface StateMsg {
  language?: string | null;
  parameters?: string[] | null;
  script_url?: string | null;
}
export type InitMsg = State;
export interface State {
  language: string;
  parameters: string[];
  script_url: string;
}
export interface Contracts {
  dsources: HumanAddr[];
  oscript: HumanAddr;
  tcases: HumanAddr[];
}
export interface TestCaseMsg {
  expected_output: string;
  parameters: string[];
}
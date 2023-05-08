import {HumanAddr, Uint128, Binary, Coin, PingInfo} from "./types";
export type ExecuteMsg = {
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
export interface GetPingInfoResponse {
  current_height: number;
  ping_info: PingInfo;
  ping_jump: number;
}
export type GetPingInfosResponse = QueryPingInfosResponse[];
export interface QueryPingInfosResponse {
  executor: Binary;
  ping_info: PingInfo;
  ping_jump: number;
}
export interface GetReadPingInfoResponse {
  checkpoint_height: number;
  latest_ping_height: number;
  prev_total_ping: number;
  total_ping: number;
}
export interface GetStateResponse {
  aioracle_addr: HumanAddr;
  base_reward: Coin;
  max_reward_claim: Uint128;
  owner: HumanAddr;
  ping_jump: number;
  ping_jump_interval: number;
}
export interface InstantiateMsg {
  aioracle_addr: HumanAddr;
  base_reward: Coin;
  ping_jump: number;
}
export interface MigrateMsg {}
export type QueryMsg = {
  get_ping_info: Binary;
} | {
  get_read_ping_info: Binary;
} | {
  get_ping_infos: {
    limit?: number | null;
    offset?: Binary | null;
    order?: number | null;
  };
} | {
  get_state: {};
};
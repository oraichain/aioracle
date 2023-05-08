import {Uint128, HumanAddr, Coin, Binary, UpdateConfigMsg, Executor, TrustingPool} from "./types";
export interface ConfigResponse {
  checkpoint_threshold: number;
  contract_fee: Coin;
  denom: string;
  max_req_threshold: number;
  owner: HumanAddr;
  pending_period: number;
  service_addr: HumanAddr;
  slashing_amount: number;
  trusting_period: number;
}
export type ExecuteMsg = {
  update_config: {
    update_config_msg: UpdateConfigMsg;
  };
} | {
  register_merkle_root: {
    executors: Binary[];
    merkle_root: string;
    stage: number;
  };
} | {
  request: {
    input?: string | null;
    preference_executor_fee: Coin;
    service: string;
    threshold: number;
  };
} | {
  withdraw_fees: {
    amount: Uint128;
    denom: string;
  };
} | {
  prepare_withdraw_pool: {
    pubkey: Binary;
  };
} | {
  executor_join: {
    executor: Binary;
  };
} | {
  executor_leave: {
    executor: Binary;
  };
} | {
  submit_evidence: {
    proof?: string[] | null;
    report: Binary;
    stage: number;
  };
};
export interface GetBoundExecutorFeeResponse {
  amount: Uint128;
  denom: string;
}
export interface GetExecutorResponse {
  executing_power: number;
  index: number;
  is_active: boolean;
  left_block?: number | null;
  pubkey: Binary;
}
export type GetExecutorSizeResponse = number;
export type GetExecutorsByIndexResponse = Executor[];
export type GetExecutorsResponse = Executor[];
export interface GetParticipantFeeResponse {
  amount: Uint128;
  denom: string;
}
export interface GetRequestResponse {
  merkle_root: string;
  request_height: number;
  requester: HumanAddr;
  rewards: [HumanAddr, string, Uint128][];
  service: string;
  stage: number;
  submit_merkle_height: number;
  threshold: number;
}
export type GetRequestsByMerkleRootResponse = RequestResponse[];
export interface RequestResponse {
  merkle_root: string;
  request_height: number;
  requester: HumanAddr;
  rewards: [HumanAddr, string, Uint128][];
  service: string;
  stage: number;
  submit_merkle_height: number;
  threshold: number;
}
export type GetRequestsByServiceResponse = RequestResponse[];
export type GetRequestsResponse = RequestResponse[];
export interface GetServiceContractsResponse {
  dsources: HumanAddr[];
  oscript: HumanAddr;
  tcases: HumanAddr[];
}
export type GetServiceFeesResponse = [HumanAddr, string, Uint128][];
export interface GetTrustingPoolResponse {
  current_height: number;
  pubkey: Binary;
  trusting_period: number;
  trusting_pool: TrustingPool;
}
export type GetTrustingPoolsResponse = TrustingPoolResponse[];
export interface TrustingPoolResponse {
  current_height: number;
  pubkey: Binary;
  trusting_period: number;
  trusting_pool: TrustingPool;
}
export interface InstantiateMsg {
  contract_fee: Coin;
  executors: Binary[];
  owner?: HumanAddr | null;
  service_addr: HumanAddr;
}
export interface IsClaimedResponse {
  is_claimed: boolean;
}
export interface LatestStageResponse {
  latest_stage: number;
}
export interface MigrateMsg {}
export type QueryMsg = {
  config: {};
} | {
  get_executors: {
    limit?: number | null;
    offset?: Binary | null;
    order?: number | null;
  };
} | {
  get_executors_by_index: {
    limit?: number | null;
    offset?: number | null;
    order?: number | null;
  };
} | {
  get_executor: {
    pubkey: Binary;
  };
} | {
  get_executor_size: {};
} | {
  get_request: {
    stage: number;
  };
} | {
  get_requests: {
    limit?: number | null;
    offset?: number | null;
    order?: number | null;
  };
} | {
  get_requests_by_service: {
    limit?: number | null;
    offset?: number | null;
    order?: number | null;
    service: string;
  };
} | {
  get_requests_by_merkle_root: {
    limit?: number | null;
    merkle_root: string;
    offset?: number | null;
    order?: number | null;
  };
} | {
  latest_stage: {};
} | {
  stage_info: {};
} | {
  get_service_contracts: {
    stage: number;
  };
} | {
  is_claimed: {
    executor: Binary;
    stage: number;
  };
} | {
  verify_data: {
    data: Binary;
    proof?: string[] | null;
    stage: number;
  };
} | {
  get_service_fees: {
    service: string;
  };
} | {
  get_bound_executor_fee: {};
} | {
  get_participant_fee: {
    pubkey: Binary;
  };
} | {
  get_trusting_pool: {
    pubkey: Binary;
  };
} | {
  get_trusting_pools: {
    limit?: number | null;
    offset?: Binary | null;
    order?: number | null;
  };
};
export interface StageInfoResponse {
  checkpoint: number;
  checkpoint_threshold: number;
  latest_stage: number;
}
export type VerifyDataResponse = boolean;
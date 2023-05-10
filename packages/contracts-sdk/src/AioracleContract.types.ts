import {Binary, Addr, Uint128, UpdateConfigMsg, Coin, Config, Executor, Uint64, ArrayOfExecutor, Boolean} from "./types";
export interface InstantiateMsg {
  executors?: Binary[] | null;
  owner?: Addr | null;
}
export type ExecuteMsg = {
  update_config: {
    update_config_msg: UpdateConfigMsg;
  };
} | {
  register_merkle_root: {
    executors: string[];
    merkle_root: string;
    stage: number;
  };
} | {
  request: {
    input?: Binary | null;
    preference_executor_fee: Coin;
    service: string;
    threshold: number;
  };
};
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
  verify_data: {
    data: Binary;
    proof?: string[] | null;
    stage: number;
  };
};
export interface MigrateMsg {}
export interface RequestResponse {
  merkle_root: string;
  request_height: number;
  requester: Addr;
  service: string;
  stage: number;
  submit_merkle_height: number;
  threshold: number;
}
export type ArrayOfRequestResponse = RequestResponse[];
export interface LatestStageResponse {
  latest_stage: number;
}
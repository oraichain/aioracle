import {Addr, Binary, UpdateConfigMsg, AddServiceMsg, Service, DataSourceState, TestCaseState, UpdateServiceMsg, Boolean, Config, Uint64, ArrayOfString, ServiceInfo} from "./types";
export interface InstantiateMsg {
  executors?: string[] | null;
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
    service: string;
    threshold: number;
  };
} | {
  add_service: AddServiceMsg;
} | {
  update_service: UpdateServiceMsg;
} | {
  delete_service: {
    service_name: string;
  };
};
export type QueryMsg = {
  config: {};
} | {
  get_executors: {
    end?: string | null;
    limit?: number | null;
    order?: number | null;
    start?: string | null;
  };
} | {
  check_executor_in_list: {
    address: string;
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
} | {
  get_service: {
    service_name: string;
  };
} | {
  get_services: {
    end?: string | null;
    limit?: number | null;
    order?: number | null;
    start?: string | null;
  };
};
export interface MigrateMsg {}
export interface RequestResponse {
  input?: Binary | null;
  merkle_root: string;
  request_height: number;
  requester: Addr;
  service: string;
  stage: number;
  submit_merkle_height: number;
  threshold: number;
}
export type ArrayOfRequestResponse = RequestResponse[];
export type ArrayOfServiceInfoResponse = ServiceInfoResponse[];
export interface ServiceInfoResponse {
  service_info: ServiceInfo;
  service_name: string;
}
export interface LatestStageResponse {
  latest_stage: number;
}
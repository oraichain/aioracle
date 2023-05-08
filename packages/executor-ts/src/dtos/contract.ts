type JsonObject = any;
type HumanAddr = string;
type Uint64 = number;
type Uint128 = string;
export type Reward = [HumanAddr, String, Uint128];

export interface Coin {
  amount: Uint128;
  denom: string;
}

export class GasObject {
  gasAmount: string = '0';
  denom: string = 'orai';
}

export class ExecuteRequest {
  mnemonic: string;
  address: string;
  handleMsg: JsonObject;
  memo?: string;
  gasData?: GasObject
};

class PingInfo {
  total_ping: Uint64;
  latest_ping_height: Uint64;
}

export class QueryPingInfoResponse {
  ping_info: PingInfo;
  ping_jump: Uint64;
  current_height: Uint64;
}

export class RequestStageResponse {
  requester: HumanAddr;
  preference_executor_fee: Coin;
  request_height: Uint64;
  submit_merkle_height: Uint64;
  merkle_root: String;
  threshold: Uint64;
  service: String;
  input?: string;
  rewards: Reward[];
}

export class AssertResponse {
  contract: HumanAddr;
  dsource_status: boolean;
  tcase_status: boolean;
}

export class GetStateResponse {
  language: string;
  parameters: string[];
  script_url: string;
}

export class AggregateResponse {
  name: string;
  price: string;
}

export class TestCaseMsg {
  parameters: String[];
  expected_output: String;
}

export class TestCaseResponse {
  total: Uint64;
  test_cases: TestCaseMsg[];
}

export class StageInfoResponse {
  latest_stage: Uint64;
  checkpoint: Uint64;
  checkpoint_threshold: Uint64;
}

export class GetServiceContractsResponse {
  dsources: HumanAddr[];
  tcases: HumanAddr[];
  oscript: HumanAddr;
}

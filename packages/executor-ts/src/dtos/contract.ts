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

export class AssertResponse {
  dsource: string;
  dSourceResult: string;
}

export class HandleScriptResponse {
  aggregateResponse: string;
  assertResults: AssertResponse[];
}

export class TestCaseMsg {
  parameters: String[];
  expected_output: String;
}

export class TestCaseResponse {
  total: Uint64;
  test_cases: TestCaseMsg[];
}

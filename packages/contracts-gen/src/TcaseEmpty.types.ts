import {HumanAddr, TestCaseMsg, Uint128, Coin, Binary} from "./types";
export interface AssertResponse {
  contract: HumanAddr;
  dsource_status: boolean;
  tcase_status: boolean;
}
export type ExecuteMsg = {
  set_owner: {
    owner: string;
  };
} | {
  add_test_case: {
    test_case: TestCaseMsg;
  };
} | {
  remove_test_case: {
    input: string[];
  };
};
export type GetOwnerResponse = string;
export interface GetTestCasesResponse {
  test_cases: TestCaseMsg[];
  total: number;
}
export interface InstantiateMsg {
  fees?: Coin | null;
  test_cases: TestCaseMsg[];
}
export type QueryMsg = {
  get_owner: {};
} | {
  get_test_cases: {
    limit?: number | null;
    offset?: Binary | null;
    order?: number | null;
  };
} | {
  assert: {
    assert_inputs: string[];
  };
};
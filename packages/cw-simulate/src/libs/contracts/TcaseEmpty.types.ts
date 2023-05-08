import {HandleMsg, TestCaseMsg, Uint128, InitMsg, Coin, Binary} from "./types";
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
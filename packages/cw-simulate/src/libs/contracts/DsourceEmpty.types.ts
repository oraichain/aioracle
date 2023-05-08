import {HumanAddr, Uint128, StateMsg, Coin, State} from "./types";
export type ExecuteMsg = {
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
export type GetOwnerResponse = string;
export interface GetStateResponse {
  language: string;
  parameters: string[];
  script_url: string;
}
export type InstantiateMsg = State;
export type QueryMsg = {
  get_state: {};
} | {
  get_owner: {};
};
import {HandleMsg, HumanAddr, Uint128, StateMsg, Coin, InitMsg, State} from "./types";
export type QueryMsg = {
  get_state: {};
} | {
  get_owner: {};
};
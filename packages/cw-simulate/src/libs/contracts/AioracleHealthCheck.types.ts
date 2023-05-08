import {HandleMsg, HumanAddr, Uint128, Binary, Coin, InitMsg} from "./types";
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
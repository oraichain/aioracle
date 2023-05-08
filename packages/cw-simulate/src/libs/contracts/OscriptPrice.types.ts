import {HandleMsg, InitMsg} from "./types";
export type QueryMsg = {
  aggregate: {
    results: string[];
  };
};
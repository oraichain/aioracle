import {} from "./types";
export type AggregateResponse = string;
export type ExecuteMsg = string;
export interface InstantiateMsg {}
export type QueryMsg = {
  aggregate: {
    results: string[];
  };
};
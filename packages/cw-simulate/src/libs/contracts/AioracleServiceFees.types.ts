import {Uint128, HumanAddr, Coin, UpdateContractMsg, PagingFeesOptions} from "./types";
export type ExecuteMsg = {
  update_service_fees: {
    fees: Coin;
  };
} | {
  remove_service_fees: null;
} | {
  update_info: UpdateContractMsg;
};
export interface GetContractInfoResponse {
  creator: HumanAddr;
}
export type GetListServiceFeesResponse = ServiceFeesResponse[];
export interface ServiceFeesResponse {
  address: string;
  fees: Coin;
}
export interface GetServiceFeesResponse {
  address: string;
  fees: Coin;
}
export interface InstantiateMsg {}
export type QueryMsg = {
  get_list_service_fees: PagingFeesOptions;
} | {
  get_service_fees: {
    addr: string;
  };
} | {
  get_contract_info: {};
};
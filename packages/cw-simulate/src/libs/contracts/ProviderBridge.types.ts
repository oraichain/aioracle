import {HumanAddr, Uint128, Contracts, Coin} from "./types";
export type ExecuteMsg = {
  update_service_contracts: {
    contracts: Contracts;
    service: string;
  };
} | {
  update_config: {
    bound_executor_fee?: Coin | null;
    owner?: HumanAddr | null;
    service_fees_contract?: HumanAddr | null;
  };
};
export interface GetBoundExecutorFeeResponse {
  amount: Uint128;
  denom: string;
}
export interface GetParticipantFeeResponse {
  amount: Uint128;
  denom: string;
}
export interface InstantiateMsg {
  bound_executor_fee: Uint128;
  service: string;
  service_contracts: Contracts;
  service_fees_contract: HumanAddr;
}
export type QueryMsg = {
  service_contracts_msg: {
    service: string;
  };
} | {
  service_fee_msg: {
    service: string;
  };
} | {
  get_participant_fee: {
    addr: HumanAddr;
  };
} | {
  get_bound_executor_fee: {};
};
export interface ServiceContractsMsgResponse {
  dsources: HumanAddr[];
  oscript: HumanAddr;
  tcases: HumanAddr[];
}
export type ServiceFeeMsgResponse = [HumanAddr, string, Uint128][];
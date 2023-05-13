import { AioracleContractClient } from "@oraichain/aioracle-contracts-sdk/src";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { AccountData } from "@cosmjs/amino";

export class Leaf {
  executor: string;
  executorPubkey: string;
  data: string;
};

export class ReportSubmittedResponse {
  code: number;
  submitted: boolean;
  report?: any;
}

export type ProcessDataParams = {
  serviceName: string;
  aioracleClient: AioracleContractClient;
  requestId: number;
  executor: AccountData;
  wallet: DirectSecp256k1HdWallet;
  input?: string;
}

export type MessageSign = {
  requestId: number,
  report: Leaf,
}

export type Report = {
  executor: string,
  data: string,
  signature: string,
}

export type PostMessage = {
  request_id: number,
  report: Report
}
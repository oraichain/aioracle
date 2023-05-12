import { AioracleContractClient } from "@oraichain/aioracle-contracts-sdk/src";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

export class Leaf {
  executor: string;
  data: string;
};

export class ReportSubmittedResponse {
  code: number;
  submitted: boolean;
  report?: any;
}

export class ProcessDataParams {
  serviceName: string;
  aioracleClient: AioracleContractClient;
  requestId: number;
  executor: string;
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
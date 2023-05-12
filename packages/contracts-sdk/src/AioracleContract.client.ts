/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.27.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import {Addr, UpdateConfigMsg, AddServiceMsg, Service, DataSourceState, TestCaseState, UpdateServiceMsg, Binary, Boolean, Config, Uint64, ArrayOfString, ServiceInfo} from "./types";
import {InstantiateMsg, ExecuteMsg, QueryMsg, MigrateMsg, RequestResponse, ArrayOfRequestResponse, ArrayOfServiceInfoResponse, ServiceInfoResponse, LatestStageResponse} from "./AioracleContract.types";
export interface AioracleContractReadOnlyInterface {
  contractAddress: string;
  config: () => Promise<Config>;
  getExecutors: ({
    end,
    limit,
    order,
    start
  }: {
    end?: string;
    limit?: number;
    order?: number;
    start?: string;
  }) => Promise<ArrayOfString>;
  checkExecutorInList: ({
    address
  }: {
    address: string;
  }) => Promise<Boolean>;
  getExecutorSize: () => Promise<Uint64>;
  getRequest: ({
    stage
  }: {
    stage: number;
  }) => Promise<RequestResponse>;
  getRequests: ({
    limit,
    offset,
    order
  }: {
    limit?: number;
    offset?: number;
    order?: number;
  }) => Promise<ArrayOfRequestResponse>;
  getRequestsByService: ({
    limit,
    offset,
    order,
    service
  }: {
    limit?: number;
    offset?: number;
    order?: number;
    service: string;
  }) => Promise<ArrayOfRequestResponse>;
  getRequestsByMerkleRoot: ({
    limit,
    merkleRoot,
    offset,
    order
  }: {
    limit?: number;
    merkleRoot: string;
    offset?: number;
    order?: number;
  }) => Promise<ArrayOfRequestResponse>;
  latestStage: () => Promise<LatestStageResponse>;
  verifyData: ({
    data,
    proof,
    stage
  }: {
    data: Binary;
    proof?: string[];
    stage: number;
  }) => Promise<Boolean>;
  getService: ({
    serviceName
  }: {
    serviceName: string;
  }) => Promise<ServiceInfo>;
  getServices: ({
    end,
    limit,
    order,
    start
  }: {
    end?: string;
    limit?: number;
    order?: number;
    start?: string;
  }) => Promise<ArrayOfServiceInfoResponse>;
}
export class AioracleContractQueryClient implements AioracleContractReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.config = this.config.bind(this);
    this.getExecutors = this.getExecutors.bind(this);
    this.checkExecutorInList = this.checkExecutorInList.bind(this);
    this.getExecutorSize = this.getExecutorSize.bind(this);
    this.getRequest = this.getRequest.bind(this);
    this.getRequests = this.getRequests.bind(this);
    this.getRequestsByService = this.getRequestsByService.bind(this);
    this.getRequestsByMerkleRoot = this.getRequestsByMerkleRoot.bind(this);
    this.latestStage = this.latestStage.bind(this);
    this.verifyData = this.verifyData.bind(this);
    this.getService = this.getService.bind(this);
    this.getServices = this.getServices.bind(this);
  }

  config = async (): Promise<Config> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {}
    });
  };
  getExecutors = async ({
    end,
    limit,
    order,
    start
  }: {
    end?: string;
    limit?: number;
    order?: number;
    start?: string;
  }): Promise<ArrayOfString> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_executors: {
        end,
        limit,
        order,
        start
      }
    });
  };
  checkExecutorInList = async ({
    address
  }: {
    address: string;
  }): Promise<Boolean> => {
    return this.client.queryContractSmart(this.contractAddress, {
      check_executor_in_list: {
        address
      }
    });
  };
  getExecutorSize = async (): Promise<Uint64> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_executor_size: {}
    });
  };
  getRequest = async ({
    stage
  }: {
    stage: number;
  }): Promise<RequestResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_request: {
        stage
      }
    });
  };
  getRequests = async ({
    limit,
    offset,
    order
  }: {
    limit?: number;
    offset?: number;
    order?: number;
  }): Promise<ArrayOfRequestResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_requests: {
        limit,
        offset,
        order
      }
    });
  };
  getRequestsByService = async ({
    limit,
    offset,
    order,
    service
  }: {
    limit?: number;
    offset?: number;
    order?: number;
    service: string;
  }): Promise<ArrayOfRequestResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_requests_by_service: {
        limit,
        offset,
        order,
        service
      }
    });
  };
  getRequestsByMerkleRoot = async ({
    limit,
    merkleRoot,
    offset,
    order
  }: {
    limit?: number;
    merkleRoot: string;
    offset?: number;
    order?: number;
  }): Promise<ArrayOfRequestResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_requests_by_merkle_root: {
        limit,
        merkle_root: merkleRoot,
        offset,
        order
      }
    });
  };
  latestStage = async (): Promise<LatestStageResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      latest_stage: {}
    });
  };
  verifyData = async ({
    data,
    proof,
    stage
  }: {
    data: Binary;
    proof?: string[];
    stage: number;
  }): Promise<Boolean> => {
    return this.client.queryContractSmart(this.contractAddress, {
      verify_data: {
        data,
        proof,
        stage
      }
    });
  };
  getService = async ({
    serviceName
  }: {
    serviceName: string;
  }): Promise<ServiceInfo> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_service: {
        service_name: serviceName
      }
    });
  };
  getServices = async ({
    end,
    limit,
    order,
    start
  }: {
    end?: string;
    limit?: number;
    order?: number;
    start?: string;
  }): Promise<ArrayOfServiceInfoResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_services: {
        end,
        limit,
        order,
        start
      }
    });
  };
}
export interface AioracleContractInterface extends AioracleContractReadOnlyInterface {
  contractAddress: string;
  sender: string;
  updateConfig: ({
    updateConfigMsg
  }: {
    updateConfigMsg: UpdateConfigMsg;
  }, $fee?: number | StdFee | "auto", $memo?: string, $funds?: Coin[]) => Promise<ExecuteResult>;
  registerMerkleRoot: ({
    executors,
    merkleRoot,
    stage
  }: {
    executors: string[];
    merkleRoot: string;
    stage: number;
  }, $fee?: number | StdFee | "auto", $memo?: string, $funds?: Coin[]) => Promise<ExecuteResult>;
  request: ({
    input,
    service,
    threshold
  }: {
    input?: string;
    service: string;
    threshold: number;
  }, $fee?: number | StdFee | "auto", $memo?: string, $funds?: Coin[]) => Promise<ExecuteResult>;
  addService: ({
    service,
    serviceName
  }: {
    service: Service;
    serviceName: string;
  }, $fee?: number | StdFee | "auto", $memo?: string, $funds?: Coin[]) => Promise<ExecuteResult>;
  updateService: ({
    dsources,
    newOwner,
    oscriptUrl,
    serviceName,
    tcases
  }: {
    dsources?: DataSourceState[];
    newOwner?: string;
    oscriptUrl?: string;
    serviceName: string;
    tcases?: TestCaseState[];
  }, $fee?: number | StdFee | "auto", $memo?: string, $funds?: Coin[]) => Promise<ExecuteResult>;
  deleteService: ({
    serviceName
  }: {
    serviceName: string;
  }, $fee?: number | StdFee | "auto", $memo?: string, $funds?: Coin[]) => Promise<ExecuteResult>;
}
/**
 * Basic AI Oracle contract interaction
 * ```ts
 * import { SimulateCosmWasmClient } from '@terran-one/cw-simulate';
import { AioracleContractClient, AioracleContractTypes, DataSourceState, Service } from '@oraichain/aioracle-contracts-sdk';
import { getContractDir } from '@oraichain/aioracle-contracts-build';

import { assert } from 'console';

const admin = 'admin_aioraclev2';
const client = new SimulateCosmWasmClient({
  chainId: 'Oraichain-testnet',
  bech32Prefix: 'orai'
});
const SERVICE_DEFAULT = 'price';

export const basicProviderFlow = async () => {
  const { contractAddress } = await client.deploy(
    admin,
    getContractDir(),
    {
      executors: getExecutors()
    } as AioracleContractTypes.InstantiateMsg,
    'aioraclev2 label'
  );
  const aioracleContract = new AioracleContractClient(client, admin, contractAddress);
  await addService(aioracleContract);
  const result = await aioracleContract.request({ input: undefined, service: SERVICE_DEFAULT, threshold: 1 });
  console.log("request result: ", result);
}

const addService = async (aioracle: AioracleContractClient) => {
  const serviceData: Service = { oscript_url: "https://raw.githubusercontent.com/oraichain/deno-scripts/bf3fbc3265f9698a1a0a85c5e7724ed91f4e562f/src/pricefeed/emptyOscript.js", tcases: [], dsources: [{ language: "node", parameters: ["BTC", "ETH", "BNB", "XRP", "DOGE", "USDT", "LINK", "UNI", "USDC", "BUSD", "ORAI", "DAI", "SOL", "MATIC", "SUSHI", "DOT", "LUNA", "ICP", "XLM", "ATOM", "AAVE", "THETA", "EOS", "CAKE", "AXS", "ALGO", "MKR", "KSM", "XTZ", "FIL", "AMP", "RUNE", "COMP"], script_url: "https://raw.githubusercontent.com/oraichain/deno-scripts/ea584de4397312b9cc88e518e9e5ae68678e8a8c/src/pricefeed/coinbase.js" } as DataSourceState] };
  await aioracle.addService({ serviceName: SERVICE_DEFAULT, service: serviceData });

  const service = await aioracle.getService({ serviceName: SERVICE_DEFAULT });
  assert(service.service.dsources.length === 1);
  assert(service.service.tcases.length === 0);
  assert(service.service.oscript_url.length > 0);
}

const getExecutors = (): any[] => {
  const executors = [
    "orai18hr8jggl3xnrutfujy2jwpeu0l76azprlvgrwt",
    "orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573"
  ];
  return executors;
};
 * ```
 * Basic AI Oracle backend interaction to retrieve service reports
 * ```ts
 * async function collectReports(url: string, contractAddr: string, requestId: number, threshold: number) {
  let count = 0;
  let reports: any;
  do {
    try {
      reports = await fetch(`${url}/report/reports?contract_addr=${contractAddr}&request_id=${requestId}`).then(data => data.json());
      console.log("reports: ", reports)
      if (!reports.data || reports.data.data.length < threshold) throw "error";
    } catch (error) {
      count++;
      if (count > 100) break; // break the loop and return the request id.
      // sleep for a few seconds then repeat
      await new Promise(r => setTimeout(r, 5000));
    }

  } while (!reports.data || reports.data.data.length < threshold);
  return reports.data;
}
 * ```
 */
export class AioracleContractClient extends AioracleContractQueryClient implements AioracleContractInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress);
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.updateConfig = this.updateConfig.bind(this);
    this.registerMerkleRoot = this.registerMerkleRoot.bind(this);
    this.request = this.request.bind(this);
    this.addService = this.addService.bind(this);
    this.updateService = this.updateService.bind(this);
    this.deleteService = this.deleteService.bind(this);
  }

  updateConfig = async ({
    updateConfigMsg
  }: {
    updateConfigMsg: UpdateConfigMsg;
  }, $fee: number | StdFee | "auto" = "auto", $memo?: string, $funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_config: {
        update_config_msg: updateConfigMsg
      }
    }, $fee, $memo, $funds);
  };
  registerMerkleRoot = async ({
    executors,
    merkleRoot,
    stage
  }: {
    executors: string[];
    merkleRoot: string;
    stage: number;
  }, $fee: number | StdFee | "auto" = "auto", $memo?: string, $funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      register_merkle_root: {
        executors,
        merkle_root: merkleRoot,
        stage
      }
    }, $fee, $memo, $funds);
  };
  request = async ({
    input,
    service,
    threshold
  }: {
    input?: string;
    service: string;
    threshold: number;
  }, $fee: number | StdFee | "auto" = "auto", $memo?: string, $funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      request: {
        input,
        service,
        threshold
      }
    }, $fee, $memo, $funds);
  };
  addService = async ({
    service,
    serviceName
  }: {
    service: Service;
    serviceName: string;
  }, $fee: number | StdFee | "auto" = "auto", $memo?: string, $funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      add_service: {
        service,
        service_name: serviceName
      }
    }, $fee, $memo, $funds);
  };
  updateService = async ({
    dsources,
    newOwner,
    oscriptUrl,
    serviceName,
    tcases
  }: {
    dsources?: DataSourceState[];
    newOwner?: string;
    oscriptUrl?: string;
    serviceName: string;
    tcases?: TestCaseState[];
  }, $fee: number | StdFee | "auto" = "auto", $memo?: string, $funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_service: {
        dsources,
        new_owner: newOwner,
        oscript_url: oscriptUrl,
        service_name: serviceName,
        tcases
      }
    }, $fee, $memo, $funds);
  };
  deleteService = async ({
    serviceName
  }: {
    serviceName: string;
  }, $fee: number | StdFee | "auto" = "auto", $memo?: string, $funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      delete_service: {
        service_name: serviceName
      }
    }, $fee, $memo, $funds);
  };
}
import { coin, coins } from '@cosmjs/amino';
import { SimulateCosmWasmClient } from '@terran-one/cw-simulate';
import { AioracleContractClient, AioracleContractTypes, DataSourceState, Service } from '@oraichain/aioracle-contracts-sdk';
import { getContractDir } from '@oraichain/aioracle-contracts-build';

import { assert } from 'console';

const admin = 'admin_aioraclev2';
const client = new SimulateCosmWasmClient({
  chainId: 'Oraichain-testnet',
  bech32Prefix: 'orai'
});
const SERVICE_DEFAULT = 'price';
const EXECUTOR_ADDRESS = 'orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573';

export const aioracle = async () => {
  client.app.bank.setBalance(admin, [coin('10000000000', 'orai')]);
  const { contractAddress } = await client.deploy(
    admin,
    getContractDir(),
    {
      owner: EXECUTOR_ADDRESS,
      executors: getExecutors()
    } as AioracleContractTypes.InstantiateMsg,
    'aioraclev2 label'
  );

  // // // exec create stage executor txs
  const funds = coins(10, 'orai');

  const aioracleContract = new AioracleContractClient(client, admin, contractAddress);
  await testQueryExecutors(aioracleContract);
  await testAddService(aioracleContract);
  await testUpdateService(aioracleContract);
};

// test get executor list
const testQueryExecutors = async (aioracle: AioracleContractClient) => {
  let executors = await aioracle.getExecutors({ limit: 1 });
  assert(executors.length === 1, "executor length with limit 1 is not equal to 1");

  executors = await aioracle.getExecutors({ start: null, end: null });
  assert(executors.length === getExecutors().length, 'executor length with no limit should return length of getExecutors')
}

const testAddService = async (aioracle: AioracleContractClient) => {
  const serviceData: Service = { oscript_url: "https://orai.io", tcases: [{ inputs: [Buffer.from("1").toString('base64')], expected_output: Buffer.from("2").toString('base64') }], dsources: [{ language: "node", parameters: [Buffer.from("foobar").toString('base64')], script_url: "https://" } as DataSourceState] };
  await aioracle.addService({ serviceName: SERVICE_DEFAULT, service: serviceData });

  const service = await aioracle.getService({ serviceName: SERVICE_DEFAULT });
  console.dir(service.service, { depth: null })
  console.dir(serviceData, { depth: null })
  assert(service.service.dsources.length === 1);
  assert(service.service.tcases.length === 1);
  assert(service.service.oscript_url.length > 0);
}

const testUpdateService = async (aioracle: AioracleContractClient) => {
  // since we are re-using the same client so the add service state is retained. This function should only called after testAddService
  await aioracle.updateService({ serviceName: SERVICE_DEFAULT, dsources: [] });
  const service = await aioracle.getService({ serviceName: SERVICE_DEFAULT });
  assert(service.service.dsources.length === 0);
  assert(service.service.tcases.length === 1);
  assert(service.service.oscript_url.length > 0);
}

const getExecutors = (): any[] => {
  const executors = [
    "orai18hr8jggl3xnrutfujy2jwpeu0l76azprlvgrwt",
    EXECUTOR_ADDRESS
  ];
  return executors;
};

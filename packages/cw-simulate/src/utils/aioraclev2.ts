import { coin, coins } from '@cosmjs/amino';
import { SimulateCosmWasmClient } from '@terran-one/cw-simulate';
import * as ServiceFeeTypes from '../libs/contracts/AioracleServiceFees.types';
import * as AiOracleTypes from '../libs/contracts/AioracleV2.types';
import * as DsourceEmptyTypes from '../libs/contracts/DsourceEmpty.types';
import * as TcaseEmptyTypes from '../libs/contracts/TcaseEmpty.types';
import * as OscriptBasicTypes from '../libs/contracts/OscriptBasic.types';
import * as ProviderBridgeTypes from '../libs/contracts/ProviderBridge.types';
import { AioracleV2Client } from '../libs/contracts/AioracleV2.client';
import { AioracleServiceFeesClient } from '../libs/contracts/AioracleServiceFees.client';
import { ProviderBridgeClient } from '../libs/contracts/ProviderBridge.client';
import { DsourceEmptyClient } from '../libs/contracts/DsourceEmpty.client';
import { TcaseEmptyClient } from '../libs/contracts/TcaseEmpty.client';
import { OscriptBasicQueryClient } from '../libs/contracts/OscriptBasic.client';
import path from 'path';

const admin = 'admin_aioraclev2';
const client = new SimulateCosmWasmClient({
  chainId: 'Oraichain-testnet',
  bech32Prefix: 'orai'
});
const SERVICE_DEFAULT = 'price';
const EXECUTOR_PUBKEY = 'AipQCudhlHpWnHjSgVKZ+SoSicvjH7Mp5gCFyDdlnQtn';

const testDataDir = path.resolve(__dirname, '..', 'testdata');

export const aioraclev2 = async () => {
  console.log(1111111, executorsDemo());
  client.app.bank.setBalance(admin, [coin('10000000000', 'orai')]);
  const serviceFeesRes = await serviceFees();
  const provideBridgeContract = await providerBridge(serviceFeesRes.contractAddress);
  const aioraclev2 = await client.deploy(
    admin,
    path.join(testDataDir, 'aioracle_v2.wasm'),
    {
      owner: null,
      service_addr: provideBridgeContract.contractAddress,
      contract_fee: coin(1, 'orai'),
      executors: executorsDemo()
    } as AiOracleTypes.InstantiateMsg,
    'aioraclev2 label'
  );

  // // // exec create stage executor txs
  const funds = coins(10, 'orai');

  const aioraclev2Contract = new AioracleV2Client(client, admin, aioraclev2.contractAddress);
  const execCreateStage = await aioraclev2Contract.request({ threshold: 1, service: serviceFeesRes.contractAddress, preferenceExecutorFee: coin(1, 'orai') }, 'auto', null, funds);

  console.log('aioraclev2 exec create stage executor txs', execCreateStage);

  // // // exec register merkle root
  const execRegisterMerkleRoot = await aioraclev2Contract.registerMerkleRoot(
    {
      stage: 1,
      merkleRoot: '4a2e27a2befb41a0655b8fe98d9c1a9f18ece280dc78b442734ead617e6bf3fc',
      executors: [executorSingle()]
    },
    'auto'
  );
  console.log('aioraclev2 exec register merkele root', execRegisterMerkleRoot);

  // // // query
  const queryConfig = await aioraclev2Contract.config();
  const queryExecutors = await aioraclev2Contract.getExecutors({});
  const queryBoundExecutorFee = await aioraclev2Contract.getBoundExecutorFee();
  const queryGetParticipantFee = await aioraclev2Contract.getParticipantFee({
    pubkey: EXECUTOR_PUBKEY
  });

  console.log('aioraclev2 query config', queryConfig, 'EXECUTORS', queryExecutors, 'queryBoundExecutorFee', queryBoundExecutorFee, 'queryGetParticipantFee', queryGetParticipantFee);
};

const providerBridge = async (serviceFeeContractAddr: string): Promise<ProviderBridgeClient> => {
  const dsourcesRes = await client.deploy(
    admin,
    path.join(testDataDir, 'dsource_empty.wasm'),
    {
      language: 'node',
      script_url: 'https://gist.githubusercontent.com/tubackkhoa/4ab5353a5b44118ccd697f14df65733f/raw/4a27d2ac4255d23463286898b161eda87d1b95bb/datasource_coingecko.js',
      parameters: ['ethereum']
    } as DsourceEmptyTypes.InstantiateMsg,
    'dsource',
    'auto'
  );
  const dsourceContract = new DsourceEmptyClient(client, admin, dsourcesRes.contractAddress);

  const tcaseRes = await client.deploy(
    admin,
    path.join(testDataDir, 'tcase_empty.wasm'),
    {
      test_cases: [
        {
          parameters: ['ethereum 0'],
          expected_output: 'hello0'
        }
      ]
    } as TcaseEmptyTypes.InstantiateMsg,
    'tcase',
    'auto'
  );
  const tcaseContract = new TcaseEmptyClient(client, admin, tcaseRes.contractAddress);

  const oscriptRes = await client.deploy(admin, path.join(testDataDir, 'oscript_basic.wasm'), {} as OscriptBasicTypes.InstantiateMsg, 'tcase', 'auto');
  const oscriptContract = new OscriptBasicQueryClient(client, oscriptRes.contractAddress);

  const { contractAddress } = await client.deploy(
    admin,
    path.join(testDataDir, 'provider_bridge.wasm'),
    {
      service: SERVICE_DEFAULT,
      service_contracts: {
        dsources: [dsourceContract.contractAddress],
        tcases: [tcaseContract.contractAddress],
        oscript: oscriptContract.contractAddress
      },
      service_fees_contract: serviceFeeContractAddr,
      bound_executor_fee: '1'
    } as ProviderBridgeTypes.InstantiateMsg,
    'provider bridge label'
  );

  return new ProviderBridgeClient(client, admin, contractAddress);
};

const serviceFees = async (): Promise<AioracleServiceFeesClient> => {
  const { contractAddress } = await client.deploy(admin, path.join(testDataDir, 'aioracle_service_fees.wasm'), {} as ServiceFeeTypes.InstantiateMsg, 'service fee label');
  return new AioracleServiceFeesClient(client, admin, contractAddress);
};

const executorsDemo = (): any[] => {
  const pubKeys = [
    'Agq2Xl1IcoOt4IRhaA2pO7xq2SBGBfsQuopQnptmos1q',
    'Ahc1poKD9thmAX8dMgFCVKhpUjyVYHfB0q/XTwPuD/J/',
    'Ah11L/hsl9J9mXkH9xFzKQbw9F/wh0n6JaKitTzptYqR',
    'AiIhSld8auqXnAE2Hzcr5gBrmLaHxbFrIbZcpb3iG0Zz',
    'A6ENA5I5QhHyy1QIOLkgTcf/x31WE+JLFoISgmcQaI0t',
    'A3PR7VXxp/lU5cQRctmDRjmyuMi50M+qiy1lKl3GYgeA',
    'A/2zTPo7IjMyvf41xH2uS38mcjW5wX71CqzO+MwsuKiw',
    EXECUTOR_PUBKEY
  ];
  return pubKeys;
};

const executorSingle = (pubkey = EXECUTOR_PUBKEY) => {
  return Buffer.from(
    JSON.stringify({
      pubkey: pubkey,
      executing_power: 0,
      index: 1,
      is_active: true,
      left_block: null
    })
  ).toString('base64');
};

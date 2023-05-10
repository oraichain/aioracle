import { coin, coins } from '@cosmjs/amino';
import { SimulateCosmWasmClient } from '@terran-one/cw-simulate';
import { AioracleContractClient, AioracleContractTypes } from '@oraichain/aioracle-contracts-sdk';
import { getContractDir } from '@oraichain/aioracle-contracts-build';

import path from 'path';

const admin = 'admin_aioraclev2';
const client = new SimulateCosmWasmClient({
  chainId: 'Oraichain-testnet',
  bech32Prefix: 'orai'
});
const SERVICE_DEFAULT = 'price';
const EXECUTOR_PUBKEY = 'AipQCudhlHpWnHjSgVKZ+SoSicvjH7Mp5gCFyDdlnQtn';

const testDataDir = path.resolve(__dirname, '..', 'testdata');

export const aioracle = async () => {
  console.log(1111111, executorsDemo());
  client.app.bank.setBalance(admin, [coin('10000000000', 'orai')]);

  const { contractAddress } = await client.deploy(
    admin,
    getContractDir(),
    {
      owner: null,
      executors: executorsDemo()
    } as AioracleContractTypes.InstantiateMsg,
    'aioraclev2 label'
  );

  // // // exec create stage executor txs
  const funds = coins(10, 'orai');

  const aioracleContract = new AioracleContractClient(client, admin, contractAddress);
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

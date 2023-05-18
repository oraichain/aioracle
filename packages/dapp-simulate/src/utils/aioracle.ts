import { coin } from '@cosmjs/amino';
import { deployContract } from '@oraichain/aioracle-contracts-build';
import { AioracleContractClient, DataSourceState, Service } from '@oraichain/aioracle-contracts-sdk';
import { handleScript } from '@oraichain/executor/src/utils/script-execute';
import { SimulateCosmWasmClient } from '@terran-one/cw-simulate';

import { assert } from 'console';

const admin = 'admin_aioraclev2';
const client = new SimulateCosmWasmClient({
  chainId: 'Oraichain-testnet',
  bech32Prefix: 'orai'
});
const SERVICE_DEFAULT = 'price';
const EXECUTOR_ADDRESS = 'orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573';

export const basicProviderFlow = async () => {
  const { contractAddress } = await deployContract(
    client,
    admin,
    {
      owner: EXECUTOR_ADDRESS,
      executors: getExecutors()
    },
    'aioraclev2 label'
  );
  const aioracleContract = new AioracleContractClient(client, admin, contractAddress);
  await addService(aioracleContract);
  const threshold = 1;
  const result = await aioracleContract.request({ input: undefined, service: SERVICE_DEFAULT, threshold });
  console.dir(result, { depth: null });
  const requestId = result.events.find((event) => event.type === 'wasm').attributes.find((attr) => attr.key === 'stage').value;
  console.log('request id: ', result.events.find((event) => event.type === 'wasm').attributes.find((attr) => attr.key === 'stage').value);
  await collectReports(process.env.AIORACLE_BACKEND_URL, aioracleContract.contractAddress, parseInt(requestId), threshold);
};

export const aioracleDemo = async () => {
  client.app.bank.setBalance(admin, [coin('10000000000', 'orai')]);
  const { contractAddress } = await deployContract(
    client,
    admin,
    {
      owner: EXECUTOR_ADDRESS,
      executors: getExecutors()
    },
    'aioraclev2 label'
  );

  const aioracleContract = new AioracleContractClient(client, admin, contractAddress);
  await addService(aioracleContract);
  const service = await aioracleContract.getService({ serviceName: SERVICE_DEFAULT });
  const handleScriptResult = await handleScript(service.service, '');
  console.log('handle script result: ', handleScriptResult);
  assert(handleScriptResult.aggregateResponse === 'aggregated');
  assert(handleScriptResult.dsourceResults.length > 0);
};

const addService = async (aioracle: AioracleContractClient) => {
  const serviceData: Service = {
    oscript_url: 'https://raw.githubusercontent.com/oraichain/deno-scripts/bf3fbc3265f9698a1a0a85c5e7724ed91f4e562f/src/pricefeed/emptyOscript.js',
    tcases: [],
    dsources: [
      {
        language: 'node',
        parameters: [
          'BTC',
          'ETH',
          'BNB',
          'XRP',
          'DOGE',
          'USDT',
          'LINK',
          'UNI',
          'USDC',
          'BUSD',
          'ORAI',
          'DAI',
          'SOL',
          'MATIC',
          'SUSHI',
          'DOT',
          'LUNA',
          'ICP',
          'XLM',
          'ATOM',
          'AAVE',
          'THETA',
          'EOS',
          'CAKE',
          'AXS',
          'ALGO',
          'MKR',
          'KSM',
          'XTZ',
          'FIL',
          'AMP',
          'RUNE',
          'COMP'
        ],
        script_url: 'https://raw.githubusercontent.com/oraichain/deno-scripts/ea584de4397312b9cc88e518e9e5ae68678e8a8c/src/pricefeed/coinbase.js'
      } as DataSourceState
    ]
  };
  await aioracle.addService({ serviceName: SERVICE_DEFAULT, service: serviceData });

  const service = await aioracle.getService({ serviceName: SERVICE_DEFAULT });
  assert(service.service.dsources.length === 1);
  assert(service.service.tcases.length === 0);
  assert(service.service.oscript_url.length > 0);
};

function getExecutors(): any[] {
  const executors = ['orai18hr8jggl3xnrutfujy2jwpeu0l76azprlvgrwt', EXECUTOR_ADDRESS];
  return executors;
}

async function collectReports(url: string, contractAddr: string, requestId: number, threshold: number) {
  let count = 0;
  let reports: any;
  do {
    try {
      reports = await fetch(`${url}/report/reports?contract_addr=${contractAddr}&request_id=${requestId}`).then((data) => data.json());
      console.log('reports: ', reports);
      if (!reports.data || reports.data.data.length < threshold) throw 'error';
    } catch (error) {
      count++;
      if (count > 100) break; // break the loop and return the request id.
      // sleep for a few seconds then repeat
      await new Promise((r) => setTimeout(r, 5000));
    }
  } while (!reports.data || reports.data.data.length < threshold);
  return reports.data;
}

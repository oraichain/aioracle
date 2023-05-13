import { submitReport, checkSubmit } from './common';
import config from '../config';
import { getCosmWasmClient } from './cosmjs';
import { executeService } from './script-execute';
import { logError } from './logs';
import { Leaf, ProcessDataParams } from 'src/dtos';
import { AioracleContractClient } from '@oraichain/aioracle-contracts-sdk/src';

export const processRequest = async (requestId: number, mnemonic: string) => {
  console.log('request id: ', requestId);
  const contractAddr = config.CONTRACT_ADDRESS;
  const { wallet, account, client } = await getCosmWasmClient(mnemonic);
  const executor = account;
  const aioracleClient = new AioracleContractClient(client, executor.address, contractAddr);
  const { submitted } = await checkSubmit(contractAddr, requestId, executor.address);
  if (submitted) {
    return; // no need to submit again. Wait for other executors
  }
  const request = await aioracleClient.getRequest({ stage: requestId });
  // get service contracts to get data from the scripts, then submit report
  return processData({
    serviceName: request.service,
    aioracleClient,
    requestId,
    input: request.input,
    executor,
    wallet
  });
};

const processData = async ({ serviceName, aioracleClient, requestId, executor, wallet, input }: ProcessDataParams) => {
  // get service contracts to get data from the scripts, then submit report
  return executeService(requestId, serviceName, input, aioracleClient)
    .then(async (executeResult) => {
      const leaf: Leaf = {
        executor: executor.address,
        executorPubkey: Buffer.from(executor.pubkey).toString('base64'),
        data: executeResult.serviceResult
      };
      console.log('request id after getting new leaf data: ', executeResult.requestId);
      // use req id returned from the getData to preserve the id when getting data
      // check again if has submitted. This is because getting data takes a long time. During this period, another process may have finished already
      // try to collect leaf from backend
      const { submitted } = await checkSubmit(aioracleClient.contractAddress, requestId, executor.address);
      if (!submitted) {
        await submitReport(executeResult.requestId, leaf, wallet);
      }
    })
    .catch((error: Error) => {
      logError(error, 'error get data process Data: ');
    });
};

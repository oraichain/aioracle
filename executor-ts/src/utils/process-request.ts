import {
  submitReport,
  checkSubmit,
  getRequest
} from './common';
import config from '../config';
import { getFirstWalletPubkey, queryWasm } from './cosmjs';
import { getData } from './script-execute';
import { logError } from './logs';
import { Coin, Leaf, RequestStageResponse } from 'src/dtos';

const filterRequest = async (pubkey: string, request: RequestStageResponse): Promise<[boolean, string]> => {
  if (request && request.merkle_root) {
    return [false, 'request already has merkle root'];
  }
  let executorFee: Coin = await queryWasm(config.CONTRACT_ADDRESS, JSON.stringify({
    get_participant_fee: {
      pubkey
    }
  }));

  if (!request.preference_executor_fee) {
    return [false, 'Could not query the preference fee from the request'];
  }
  if (request.preference_executor_fee.denom !== executorFee.denom ||
    parseInt(request.preference_executor_fee.amount) < parseInt(executorFee.amount)
  ) {
    return [false, 'the request fee is too low. Skip this request'];
  }
  return [true, 'valid request'];
}

export const processRequest = async (requestId: number, mnemonic: string, isAwait=false) => {
  console.log("request id: ", requestId);
  const contractAddr = config.CONTRACT_ADDRESS;
  const executor = await getFirstWalletPubkey(mnemonic);
  // try to collect leaf from backend
  const request = await getRequest(contractAddr, requestId);
  let [filterResult, message] = await filterRequest(executor, request);
  if (!filterResult) {
    console.log('processRequest not filter result', message);
    return;
  }
  const { submitted } = await checkSubmit(contractAddr, requestId, executor);
  if (submitted) {
    return; // no need to submit again. Wait for other executors
  }
  // get service contracts to get data from the scripts, then submit report
  if (isAwait) {
    await processData({
      contractAddr,
      requestId,
      input: request.input,
      executor,
      mnemonic
    });
  } else {
    processData({
      contractAddr,
      requestId,
      input: request.input,
      executor,
      mnemonic
    });
  }
};

const processData = async ({
  contractAddr,
  requestId,
  input,
  executor,
  mnemonic
}) => {
  // get service contracts to get data from the scripts, then submit report
  return getData(contractAddr, requestId, input).then(async (resultDataReward) => {
    const leaf: Leaf = {
      executor,
      data: resultDataReward.result.data,
      rewards: resultDataReward.result.rewards,
    }
    console.log("request id after getting new leaf data: ", resultDataReward.requestId);
    // use req id returned from the getData to preserve the id when getting data
    // check again if has submitted. This is because getting data takes a long time. During this period, another process may have finished already
    // try to collect leaf from backend
    const { submitted } = await checkSubmit(contractAddr, requestId, executor);
    if (!submitted) {
      await submitReport(resultDataReward.requestId, leaf, mnemonic);
    }
  }).catch((error: Error) => {
    console.error('error get data request', error);
    logError(error)
  });
}

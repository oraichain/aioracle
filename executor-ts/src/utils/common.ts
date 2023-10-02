import * as fetch from 'isomorphic-fetch';
import * as _ from 'lodash';
import { mnemonicToSeedSync } from 'bip39';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import config from 'src/config';
import { signSignature } from './crypto';
import { queryWasm, handleFetchResponse, getFirstWalletAddr } from './cosmjs';
import { boradcastExecutorResult } from './ws-server';
import { GetServiceContractsResponse, Leaf, ReportSubmittedResponse, RequestStageResponse, StageInfoResponse } from 'src/dtos';

const bip32 = BIP32Factory(ecc);

export const getRequest = async (
  contractAddr: string,
  requestId: number
): Promise<RequestStageResponse> => {
  const input = JSON.stringify({
    request: {
      stage: requestId
    }
  })
  const request = await queryWasm(contractAddr, input) as RequestStageResponse;
  return request;
}

export const getStageInfo = async (contractAddr: string): Promise<StageInfoResponse> => {
  const input = JSON.stringify({
    stage_info: {}
  })

  const data = await queryWasm(contractAddr, input);
  console.log("stage info: ", data);
  return data as StageInfoResponse;
}

export const checkSubmit = async (
  contractAddr: string,
  requestId: number,
  executor: string
): Promise<ReportSubmittedResponse> => {
  return fetch(
    `${config.BACKEND_URL}/report/submitted?contract_addr=${contractAddr}&request_id=${requestId}&executor=${Buffer.from(
      executor,
      "base64"
    ).toString("hex")}`
  ).then((data) => handleFetchResponse(data));
};

export const getServiceContracts = async (
  contractAddr: string,
  requestId: number
): Promise<GetServiceContractsResponse> => {
  const input = JSON.stringify({
    get_service_contracts: { stage: requestId }
  });
  const data = await queryWasm(contractAddr, input);
  // if (!data.data) {
  // throw "No service contracts to execute";
  // }
  return data as GetServiceContractsResponse;
}

export const generateWalletFromMnemonic = (
  mnemonic: string,
  path = config.path,
  password = ""
) => {
  const seed = mnemonicToSeedSync(mnemonic, password);
  const masterKey = bip32.fromSeed(seed);
  const hd = masterKey.derivePath(path);

  const privateKey = hd.privateKey;
  if (!privateKey) {
    throw new Error("null hd key");
  }
  return privateKey;
};

export const submitReport = async (
  requestId: number,
  leaf: Leaf,
  mnemonic: string
) => {
  const walletAddress = await getFirstWalletAddr(mnemonic)
  const pubKey = walletAddress.pubkey
  const privateKey = generateWalletFromMnemonic(mnemonic, config.path)
  const messageSign = { requestId, report: leaf };
  const signature = Buffer.from(
    signSignature(
      Buffer.from(JSON.stringify(messageSign), "ascii"),
      privateKey,
      pubKey
    )
  ).toString("base64");

  const message = {
    request_id: requestId,
    report: { ...leaf, signature }
  };
  const requestOptions = {
    method: "POST",
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
    redirect: 'follow' as RequestRedirect,
  };

  // before submiting to the backend, we fire the message's data into the websocket so listeners can listen
  boradcastExecutorResult(message);

  // submit data to the backend for aggregation
  const result = await fetch(
    `${config.BACKEND_URL}/report`,
    requestOptions
  ).then(
    (data) => handleFetchResponse(data)
  );
  console.log("result submitting report: ", result);
  console.log("Successful submission time: ", new Date().toUTCString());
}
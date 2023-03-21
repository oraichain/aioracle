import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { CosmWasmClient, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { stringToPath } from '@cosmjs/crypto';
import { GasPrice } from '@cosmjs/stargate';
import * as fetch from 'isomorphic-fetch';
import config from '../config';
import { sleep } from "./";
import { ExecuteRequest } from "src/dtos";

export const handleFetchResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    let responseText = await response.text();
    throw responseText;
  }
};

export const queryWasm = async (address: string, input: string, retryCount: number = 0) => {
  const client = await CosmWasmClient.connect(config.RPC_URL);
  try {
    const result: Object = await client.queryContractSmart(address, JSON.parse(input));
    return result;
  } catch (error) {
    console.log("error: ", error);
    console.log("retry count: ", retryCount);
    if (retryCount > 10) {
      throw error
    };
    await sleep(5000);
    return queryWasm(address, input, retryCount + 1);
  }
};

const collectWallet = async (mnemonic: string) => {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    hdPaths: [stringToPath(config.path)],
    prefix: config.prefix,
  });
  return wallet;
};

export const getFirstWalletAddr = async (mnemonic: string) => {
  let wallet = await collectWallet(mnemonic);
  const [address] = await wallet.getAccounts();
  return address;
};

export const getFirstWalletPubkey = async (mnemonic: string) => {
  const account = await getFirstWalletAddr(mnemonic);
  return Buffer.from(account.pubkey).toString('base64');
};

export const execute = async (executeReq: ExecuteRequest) => {
  try {
    const wallet = await collectWallet(executeReq.mnemonic);
    const [firstAccount] = await wallet.getAccounts();
    const client = await SigningCosmWasmClient.connectWithSigner(
      config.RPC_URL,
      wallet,
      {
        gasPrice: executeReq.gasData
          ? GasPrice.fromString(
            `${executeReq.gasData.gasAmount}${executeReq.gasData.denom}`
          )
          : undefined,
        prefix: config.prefix,
        // TODO - js use param gasLimits, ts dosen't exists SigningCosmWasmClientOptions?
        // gasLimits: { exec: 20000000 },
      }
    );
    return await client.execute(
      firstAccount.address,
      executeReq.address,
      executeReq.handleMsg,
      'auto',
      executeReq.memo
    );
  } catch (error) {
    console.error("error in executing contrac: ", error);
    throw error;
  }
};


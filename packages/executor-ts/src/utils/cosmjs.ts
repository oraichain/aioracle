import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { CosmWasmClient, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { stringToPath } from '@cosmjs/crypto';
import { GasPrice } from '@cosmjs/stargate';
import config from '../config';
import { sleep } from "./";
import { ExecuteRequest } from "src/dtos";
import { AccountData } from "@cosmjs/amino";

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

export async function collectWallet(mnemonic: string): Promise<DirectSecp256k1HdWallet> {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    hdPaths: [stringToPath(config.path)],
    prefix: config.prefix,
  });
  return wallet;
};

export async function getWallet(mnemonic: string): Promise<{ account: AccountData; wallet: DirectSecp256k1HdWallet }> {
  const wallet = await collectWallet(mnemonic);
  const account = (await wallet.getAccounts())[0];
  return { account, wallet };
}

export async function getCosmWasmClient(mnemonic: string) {
  const { account, wallet } = await getWallet(mnemonic);
  const client = await SigningCosmWasmClient.connectWithSigner(config.RPC_URL as string, wallet, {
    gasPrice: GasPrice.fromString(`${config.prefix}${config.GAS_AMOUNT}` as string)
  });
  return { client, account, wallet };
}

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


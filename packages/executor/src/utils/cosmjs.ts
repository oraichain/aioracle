import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { stringToPath } from '@cosmjs/crypto';
import { GasPrice } from '@cosmjs/stargate';
import config from '../config';
import { AccountData } from '@cosmjs/amino';

export const handleFetchResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.indexOf('application/json') !== -1) {
    return response.json();
  } else {
    let responseText = await response.text();
    throw responseText;
  }
};

export async function collectWallet(mnemonic: string): Promise<DirectSecp256k1HdWallet> {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    hdPaths: [stringToPath(config.path)],
    prefix: config.prefix
  });
  return wallet;
}

export async function getWallet(mnemonic: string): Promise<{ account: AccountData; wallet: DirectSecp256k1HdWallet }> {
  const wallet = await collectWallet(mnemonic);
  const account = (await wallet.getAccounts())[0];
  return { account, wallet };
}

export async function getCosmWasmClient(mnemonic: string) {
  const { account, wallet } = await getWallet(mnemonic);
  const client = await SigningCosmWasmClient.connectWithSigner(config.RPC_URL as string, wallet, {
    gasPrice: GasPrice.fromString(`${config.GAS_AMOUNT}${config.prefix}` as string)
  });
  return { client, account, wallet };
}

import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { stringToPath } from '@cosmjs/crypto';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { GasPrice } from '@cosmjs/stargate';
import config from '../config';

const network = {
    prefix: "orai",
}

const collectWallet = async (mnemonic) => {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
    mnemonic,
    {
      hdPaths: [stringToPath("m/44'/118'/0'/0/0")],
      prefix: network.prefix,
    }
  );
  return wallet;
}

export async function execute ({ mnemonic, msgs, memo, gasData = undefined }) {
  try {
    const wallet = await collectWallet(mnemonic);
    const [firstAccount] = await wallet.getAccounts();
    const client = await SigningCosmWasmClient.connectWithSigner(
      config.RPC_URL,
      wallet,
      {
        gasPrice: gasData ? 
            GasPrice.fromString(`${gasData.gasAmount}${gasData.denom}`) :
            undefined, 
        prefix: network.prefix 
      }
    );
    return await client.executeMultiple(
      firstAccount.address,
      msgs,
      'auto',
      memo
    );
  } catch (error) {
    console.log("error in executing contract: ", error);
    throw error;
  }
}

const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { stringToPath } = require('@cosmjs/crypto');
const { SigningCosmWasmClient } = require('@cosmjs/cosmwasm-stargate');
const { GasPrice } = require('@cosmjs/stargate');

const network = {
  rpc: process.env.NETWORK_RPC || 'https://testnet-rpc.orai.io',
  prefix: 'orai'
};

const collectWallet = async (mnemonic) => {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    hdPaths: [stringToPath("m/44'/118'/0'/0/0")],
    prefix: network.prefix
  });
  return wallet;
};

const getClientAndSender = async (mnemonic, gasData) => {
  const wallet = await collectWallet(mnemonic);
  const [sender] = await wallet.getAccounts();
  const client = await SigningCosmWasmClient.connectWithSigner(network.rpc, wallet, {
    gasPrice: gasData ? GasPrice.fromString(`${gasData.gasAmount}${gasData.denom}`) : '0orai',
    prefix: network.prefix,
    gasLimits: { exec: 20000000 }
  });
  return { client, sender };
};

module.exports = { getClientAndSender };

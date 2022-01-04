const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");
const { stringToPath } = require("@cosmjs/crypto");
const cosmwasm = require('@cosmjs/cosmwasm-stargate');
const { GasPrice } = require('@cosmjs/cosmwasm-stargate/node_modules/@cosmjs/stargate/build');

const network = {
    rpc: process.env.NETWORK_RPC || "https://testnet-rpc.orai.io",
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

const getFirstWalletAddr = async (mnemonic) => {
    let wallet = await collectWallet(mnemonic);
    let accounts = await wallet.getAccounts();
    return accounts[0].address;
}

const execute = async ({ mnemonic, address, handleMsg, memo, amount, gasData = undefined }) => {
    try {
        const wallet = await collectWallet(mnemonic);
        const [firstAccount] = await wallet.getAccounts();
        const client = await cosmwasm.SigningCosmWasmClient.connectWithSigner(network.rpc, wallet, { gasPrice: gasData ? GasPrice.fromString(`${gasData.gasAmount}${gasData.denom}`) : undefined, prefix: network.prefix });
        const input = JSON.parse(handleMsg);
        const result = await client.execute(firstAccount.address, address, input, memo, amount);
        return result.transactionHash;
    } catch (error) {
        console.log("error in executing contract: ", error);
        throw error;
    }
}

module.exports = { execute, getFirstWalletAddr };
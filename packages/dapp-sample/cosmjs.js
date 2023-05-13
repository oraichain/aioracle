const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");
const { stringToPath } = require("@cosmjs/crypto");
const cosmwasm = require('@cosmjs/cosmwasm-stargate');
const { GasPrice } = require('@cosmjs/stargate');

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

const getFirstWalletPubkey = async (mnemonic) => {
    let wallet = await collectWallet(mnemonic);
    let accounts = await wallet.getAccounts();
    return Buffer.from(accounts[0].pubkey).toString('base64');
}

const execute = async ({ mnemonic, address, handleMsg, memo, amount, gasData = undefined }) => {
    try {
        const wallet = await collectWallet(mnemonic);
        const [firstAccount] = await wallet.getAccounts();
        const client = await cosmwasm.SigningCosmWasmClient.connectWithSigner(network.rpc, wallet, { gasPrice: gasData ? GasPrice.fromString(`${gasData.gasAmount}${gasData.denom}`) : undefined, prefix: network.prefix, gasLimits: { exec: 20000000 } });
        const result = await client.execute(firstAccount.address, address, handleMsg, 'auto', memo, amount);
        return result.transactionHash;
    } catch (error) {
        console.log("error in executing contract: ", error);
        throw error;
    }
}

module.exports = { execute, getFirstWalletPubkey };
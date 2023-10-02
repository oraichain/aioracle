const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");
const { stringToPath } = require("@cosmjs/crypto");
const cosmwasm = require('@cosmjs/cosmwasm-stargate');
const { GasPrice } = require('@cosmjs/stargate');
const { env } = require("../config");

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

const execute = async ({ mnemonic, msgs, memo, gasData = undefined }) => {
    try {
        const wallet = await collectWallet(mnemonic);
        const [firstAccount] = await wallet.getAccounts();
        const client = await cosmwasm.SigningCosmWasmClient.connectWithSigner(env.RPC_URL, wallet, { gasPrice: gasData ? GasPrice.fromString(`${gasData.gasAmount}${gasData.denom}`) : undefined, prefix: network.prefix });
        const result = await client.executeMultiple(firstAccount.address, msgs, 'auto', memo);
        return result;
    } catch (error) {
        console.log("error in executing contract: ", error);
        throw error;
    }
}

module.exports = { execute };
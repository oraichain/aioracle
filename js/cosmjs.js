const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");
const { stringToPath } = require("@cosmjs/crypto");
const { network, env } = require("./config");
const cosmwasm = require('@cosmjs/cosmwasm-stargate');
const { GasPrice } = require('@cosmjs/cosmwasm-stargate/node_modules/@cosmjs/stargate/build');

const handleResult = (result) => {
    if (result.code && result.code !== 0) throw result.message;
    return result.data;
}

const queryWasm = async (address, input) => {
    let result = await fetch(`${env.LCD_URL}/wasm/v1beta1/contract/${address}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json())
    return handleResult(result);
};

const collectWallet = async (mnemonic) => {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
        mnemonic,
        {
            hdPaths: [stringToPath(network.path)],
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

const getFirstWalletPubkey = async (mnemonic) => {
    let wallet = await collectWallet(mnemonic);
    let accounts = await wallet.getAccounts();
    return Buffer.from(accounts[0].pubkey).toString('base64');
}

const execute = async ({ mnemonic, address, handleMsg, memo, gasData }) => {
    try {
        const wallet = await collectWallet(mnemonic);
        const [firstAccount] = await wallet.getAccounts();
        const client = await cosmwasm.SigningCosmWasmClient.connectWithSigner(network.rpc, wallet, { gasPrice: GasPrice.fromString(`${gasData.gasAmount}${gasData.denom}`), prefix: network.prefix });
        const result = await client.execute(firstAccount.address, address, handleMsg, memo);
        return result.transactionHash;
    } catch (error) {
        console.log("error in executing contract: ", error);
        throw error;
    }
}

module.exports = { getFirstWalletAddr, getFirstWalletPubkey, queryWasm, execute };
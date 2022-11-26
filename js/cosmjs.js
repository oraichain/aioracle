const { network, env } = require("./config");
const fetch = require("isomorphic-fetch");

const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");
const cosmwasm = require("@cosmjs/cosmwasm-stargate");
const { stringToPath } = require("@cosmjs/crypto");

const handleResult = (result) => {
    if (result.code && result.code !== 0) throw result.message;
    return result.data;
};

const handleFetchResponse = async (response) => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    } else {
        let responseText = await response.text();
        throw responseText;
    }
};

const queryWasmRetry = async (address, input, retryCount) => {
    try {
        let result = await fetch(
            `${env.LCD_URL}/cosmwasm/wasm/v1/contract/${address}/smart/${Buffer.from(input).toString("base64")}`
        ).then((data) => handleFetchResponse(data));
        return result;
    } catch (error) {
        console.log("error: ", error);
        console.log("retry count: ", retryCount);
        if (retryCount > 10) throw error;
        // await about 5 seconds
        await new Promise((r) => setTimeout(r, 5000));
        return queryWasmRetry(address, input, retryCount + 1);
    }
};

const queryWasmRaw = async (address, input) => {
    return queryWasmRetry(address, input, 0);
};

const queryWasm = async (address, input) => {
    let result = await queryWasmRetry(address, input, 0);
    return handleResult(result);
};

const collectWallet = async (mnemonic) => {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        hdPaths: [stringToPath("m/44'/118'/0'/0/0")],
        prefix: network.prefix,
    });
    return wallet;
};

const getFirstWalletAddr = async (mnemonic) => {
    let wallet = await collectWallet(mnemonic);
    const [address] = await wallet.getAccounts();
    return address;
};

const getFirstWalletPubkey = async (mnemonic) => {
    const account = await getFirstWalletAddr(mnemonic);
    return Buffer.from(account.pubkey).toString("base64");
};

const execute = async ({ mnemonic, address, handleMsg, memo, gasData }) => {
    try {
        const wallet = await collectWallet(mnemonic);
        const [firstAccount] = await wallet.getAccounts();
        const client = await cosmwasm.SigningCosmWasmClient.connectWithSigner(network.rpc, wallet, {
            gasPrice: gasData ? GasPrice.fromString(`${gasData.gasAmount}${gasData.denom}`) : undefined,
            prefix: network.prefix,
            gasLimits: { exec: 20000000 },
        });
        const input = JSON.parse(handleMsg);
        const result = await client.execute(firstAccount.address, address, input, memo);
        console.log("result: ", result);
        return result;
    } catch (error) {
        console.error("error in executing contrac: ", error);
        throw error;
    }
};

module.exports = { getFirstWalletAddr, getFirstWalletPubkey, queryWasm, execute, queryWasmRaw, handleFetchResponse };

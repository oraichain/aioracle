const { network, env } = require("./config");
const fetch = require('isomorphic-fetch');

const OraiWasmJs = require('@oraichain/oraiwasm-js').default;
const cosmos = new OraiWasmJs(network.lcd, network.chainId);
cosmos.bech32MainPrefix = network.prefix;

const handleResult = (result) => {
    if (result.code && result.code !== 0) throw result.message;
    return result.data;
}

const handleFetchResponse = async (response) => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    } else {
        let responseText = await response.text();
        throw responseText;
    }
}

const queryWasmRetry = async (address, input, retryCount) => {
    try {
        let result = await fetch(`${env.LCD_URL}/wasm/v1beta1/contract/${address}/smart/${Buffer.from(input).toString('base64')}`).then(data => handleFetchResponse(data));
        return result;
    } catch (error) {
        console.log("error: ", error);
        console.log("retry count: ", retryCount)
        if (retryCount > 10) throw error;
        // await about 5 seconds
        await new Promise(r => setTimeout(r, 5000));
        return queryWasmRetry(address, input, retryCount + 1);
    }
}

const queryWasmRaw = async (address, input) => {
    return queryWasmRetry(address, input, 0);
};

const queryWasm = async (address, input) => {
    let result = await queryWasmRetry(address, input, 0);
    return handleResult(result);
};

const collectWallet = (mnemonic) => {
    const childKey = cosmos.getChildKey(mnemonic);
    return childKey;
}

const getFirstWalletAddr = async (mnemonic) => {
    let wallet = collectWallet(mnemonic);
    return cosmos.getAddress(wallet);
}

const getFirstWalletPubkey = async (mnemonic) => {
    return Buffer.from(cosmos.getPubKey(collectWallet(mnemonic).privateKey)).toString('base64');
}

const execute = async ({ mnemonic, address, handleMsg, memo, gasData }) => {
    const childKey = collectWallet(mnemonic);
    try {
        const rawInputs = [{
            contractAddr: address,
            message: Buffer.from(JSON.stringify(handleMsg)),
        }]
        const result = await cosmos.execute({ signerOrChild: childKey, rawInputs, gasLimits: 'auto', memo });
        console.log("result: ", result);
    } catch (error) {
        console.log("error in executing contract: ", error);
        throw error;
    }
}

module.exports = { getFirstWalletAddr, getFirstWalletPubkey, queryWasm, execute, queryWasmRaw, handleFetchResponse };
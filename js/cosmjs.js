const { network, env } = require("./config");
const fetch = require('isomorphic-fetch');

const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const cosmwasm = require ('@cosmjs/cosmwasm-stargate');

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

const collectWallet =  async (mnemonic) => {
    const childKey = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        hdPaths: network.path,
        prefix: network.prefix
    });
    return childKey
}

const getFirstWalletAddr = async (mnemonic) => {
    let wallet = await collectWallet(mnemonic)
    const [address] = await wallet.getAccounts();
    return address;
}

const getFirstWalletPubkey = async (mnemonic) => {
    const account = await getFirstWalletAddr(mnemonic);
    return Buffer.from(account.pubkey).toString('base64');
}

const execute = async ({ mnemonic, address, handleMsg, memo, gasData }) => {
    const wallet = await getFirstWalletAddr(mnemonic);
    const client = await cosmwasm.SigningCosmWasmClient.connectWithSigner(network.rpc, wallet, {
        gasPrice: new GasPrice(Decimal.fromUserInput('0', 6), denom),
        prefix: network.prefix,
    });

    try {
        const result = await client.execute(wallet, address, Buffer.from(JSON.stringify(handleMsg)), 'auto', memo)
        console.log('result: ', result);
        return result;
    } catch (error) {
      console.error("error in executing contrac: ", error);
      throw error;
    }
}

module.exports = { getFirstWalletAddr, getFirstWalletPubkey, queryWasm, execute, queryWasmRaw, handleFetchResponse };
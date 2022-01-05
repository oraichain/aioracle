const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");
const { stringToPath } = require("@cosmjs/crypto");
const cosmwasm = require('@cosmjs/cosmwasm-stargate');
const { GasPrice } = require('@cosmjs/cosmwasm-stargate/node_modules/@cosmjs/stargate/build');
const data = require('../testdata/report_list.json');

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

const submitSignature = async (mnemonic, contractAddr, stage, signature) => {
    return execute({ mnemonic, address: contractAddr, handleMsg: JSON.stringify({ update_signature: { stage, signature } }), gasData: { gasAmount: "0", denom: "orai" } });
}

const isSubmitted = async (contractAddr, requestId, executor) => {
    const input = JSON.stringify({
        is_submitted: {
            stage: parseInt(requestId),
            executor,
        }
    })
    return fetch(`https://testnet-lcd.orai.io/wasm/v1beta1/contract/${contractAddr}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json())
}

// TODO: use correct input format
const getData = async (oscript) => {
    const input = JSON.stringify({
        test: {}
    });
    let data = await fetch(`https://testnet-lcd.orai.io/wasm/v1beta1/contract/${oscript}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json())
    let result = {
        data: Buffer.from(JSON.stringify(data)).toString('base64'),
        // TODO: how to add this reward
        rewards: [
            {
                recipient: "orai18hr8jggl3xnrutfujy2jwpeu0l76azprlvgrwt",
                coin: {
                    denom: "orai",
                    amount: "5",
                }
            }
        ],
    }
    return result;
}

module.exports = { execute, getFirstWalletAddr, isSubmitted, submitSignature, getData };
const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");
const { stringToPath } = require("@cosmjs/crypto");
const { handleScript } = require("./script-execute");
const { getServiceContracts } = require("./utils");
const { network } = require("./config");

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

const getData = async (contractAddr, requestId, requestInput) => {
    const serviceContracts = await getServiceContracts(contractAddr, requestId);
    let data = await handleScript(serviceContracts, requestInput);
    input = JSON.stringify({
        request: {
            stage: requestId
        }
    });
    let request = await fetch(`https://testnet-lcd.orai.io/wasm/v1beta1/contract/${contractAddr}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json())
    let result = {
        data: Buffer.from(data).toString('base64'),
        // TODO: need to filter the rewards, only allow successful results from providers receive rewards
        rewards: request.data.rewards,
    }
    return [result, requestId]; // return request id so that in the callback we can collect it
}

module.exports = { getFirstWalletAddr, getData, getFirstWalletPubkey };
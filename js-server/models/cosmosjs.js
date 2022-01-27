const Cosmos = require('@oraichain/cosmosjs').default;

// declare var cosmos: Cosmos;
const message = Cosmos.message;

const cosmos = new Cosmos(process.env.URL || 'https://testnet-lcd.orai.io', process.env.CHAIN_ID || 'Oraichain-testnet');
cosmos.setBech32MainPrefix('orai');

const getAddress = (childOrMnemonic) => {
    return cosmos.getAddress(childOrMnemonic);
};

const getHandleMessage = (contract, msg, sender, amount) => {
    const sent_funds = amount ? [{ denom: cosmos.bech32MainPrefix, amount }] : null;
    const msgSend = new message.cosmwasm.wasm.v1beta1.MsgExecuteContract({
        contract,
        msg,
        sender,
        sent_funds
    });

    return new message.google.protobuf.Any({
        type_url: '/cosmwasm.wasm.v1beta1.MsgExecuteContract',
        value: message.cosmwasm.wasm.v1beta1.MsgExecuteContract.encode(msgSend).finish()
    });
};

const getTxBody = (messages, timeout_height) => {
    return new message.cosmos.tx.v1beta1.TxBody({
        messages,
        timeout_height
    });
}

const getLatestBlock = () => {
    return cosmos.get('/blocks/latest');
}

const execute = async ({ mnemonic, contractAddr, rawMessages, gasPrices, gasLimits, timeoutHeight, timeoutIntervalCheck }) => {
    // sign the message
    const childKey = cosmos.getChildKey(mnemonic);
    let msgs = [];
    for (let message of rawMessages) {
        msgs.push(getHandleMessage(contractAddr, message, getAddress(childKey), 0));
    }
    let txBody = getTxBody(msgs, timeoutHeight);
    const fees = gasPrices ? null : gasPrices * gasLimits;
    return cosmos.submit(childKey, txBody, 'BROADCAST_MODE_SYNC', !fees || fees === 0 ? null : [{ denom: cosmos.bech32MainPrefix, amount: fees.toString() }], gasLimits, timeoutHeight, timeoutIntervalCheck);
}

module.exports = { execute, getLatestBlock };
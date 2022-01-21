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

    const msgSendAny = new message.google.protobuf.Any({
        type_url: '/cosmwasm.wasm.v1beta1.MsgExecuteContract',
        value: message.cosmwasm.wasm.v1beta1.MsgExecuteContract.encode(msgSend).finish()
    });

    return new message.cosmos.tx.v1beta1.TxBody({
        messages: [msgSendAny]
    });
};

const execute = async ({ mnemonic, contractAddr, message, fees, gasLimits }) => {
    // sign the message
    const childKey = cosmos.getChildKey(mnemonic);
    const pubKey = childKey.publicKey;
    const txBody = getHandleMessage(contractAddr, Buffer.from(message), getAddress(mnemonic), 0);

    return cosmos.submit(childKey, txBody, 'BROADCAST_MODE_SYNC', isNaN(fees) ? 0 : parseInt(fees), gasLimits);
}

module.exports = execute;
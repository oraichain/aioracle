const Cosmos = require('@oraichain/cosmosjs').default;
const { signSignature } = require('./crypto');

// declare var cosmos: Cosmos;
const message = Cosmos.message;

const cosmos = new Cosmos(process.env.URL || 'https://testnet-lcd.orai.io', process.env.CHAIN_ID || 'Oraichain-testnet');
cosmos.setBech32MainPrefix('orai');

const getAddress = (childOrMnemonic) => {
    return cosmos.getAddress(childOrMnemonic);
};

const getChildKey = (mnemonic) => {
    return cosmos.getChildKey(mnemonic);
};

const getPubKey = (mnemonic) => {
    return cosmos.getChildKey(mnemonic).publicKey.toString('base64');
}

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

const signSubmitSignatureCosmosjs = async (mnemonic, contractAddr, stage, message, fees, gasLimits) => {
    // sign the message
    const childKey = cosmos.getChildKey(mnemonic);
    const pubKey = childKey.publicKey;
    const signature = signSignature(message, childKey.privateKey, pubKey);
    const input = JSON.stringify({ update_signature: { stage: parseInt(stage), pubkey: Buffer.from(pubKey).toString('base64'), signature } });
    const txBody = getHandleMessage(contractAddr, Buffer.from(input), getAddress(mnemonic), 0);

    return cosmos.submit(childKey, txBody, 'BROADCAST_MODE_ASYNC', isNaN(fees) ? 0 : parseInt(fees), gasLimits);
}

module.exports = signSubmitSignatureCosmosjs;
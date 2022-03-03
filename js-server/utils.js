const fetch = require('isomorphic-fetch');
const { sha256 } = require('js-sha256');
const secp256k1 = require('secp256k1');
const { env } = require('./config')

const getRequest = async (contractAddr, requestId) => {

    const input = JSON.stringify({
        request: {
            stage: requestId
        }
    })

    return fetch(`${env.LCD_URL}/wasm/v1beta1/contract/${contractAddr}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json());
}

const isWhiteListed = async (contractAddr, executor) => {

    const input = JSON.stringify({
        get_executor: {
            pubkey: executor
        }
    })

    const data = await fetch(`${env.LCD_URL}/wasm/v1beta1/contract/${contractAddr}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json());
    if (!data) {
        throw "Cannot verify executor";
    }
    if (data.data) {
        return true;
    }
    return false;
}

const handleResponse = (res, status, message, data = undefined) => {
    if (data) return res.status(status).send({ message, data })
    return res.status(status).send({ message })
}

// verify the executor's signature. If match => allow to store in the report
const verifySignature = (bufferMessage, signature, pubkey) => {
    const hashedSig = sha256.update(bufferMessage).digest(); // on contract, when parsing from hex string to bytes it uses from utf8 func (ascii)
    const bufferHashedSig = Uint8Array.from(hashedSig);
    return secp256k1.ecdsaVerify(signature, bufferHashedSig, pubkey);
}

const getCurrentDateInfo = () => {
    const date = new Date();
    return { date: date.toUTCString(), timestamp: date.getTime() }
}

module.exports = { getRequest, handleResponse, isWhiteListed, verifySignature, getCurrentDateInfo };
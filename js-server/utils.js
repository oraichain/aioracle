const fetch = require('isomorphic-fetch');
const getRequest = async (contractAddr, requestId) => {

    const input = JSON.stringify({
        request: {
            stage: requestId
        }
    })

    return fetch(`https://testnet-lcd.orai.io/wasm/v1beta1/contract/${contractAddr}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json());
}

// TODO: need to collect full list of executors using paging
const isWhiteListed = async (contractAddr, executor, executorsKey) => {

    const input = JSON.stringify({
        get_executors: {
            nonce: parseInt(executorsKey)
        }
    })

    const data = await fetch(`https://testnet-lcd.orai.io/wasm/v1beta1/contract/${contractAddr}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json());
    if (!data.data) {
        throw "Cannot collect list executors";
    }
    if (data.data.includes(executor)) {
        return true;
    }
    return false;
}

const handleResponse = (res, status, message, data = undefined) => {
    if (data) return res.status(status).send({ message, data })
    return res.status(status).send({ message })
}

module.exports = { getRequest, handleResponse, isWhiteListed };